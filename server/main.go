package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"io"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/redis/go-redis/v9"
)

// Only pairs are supported
const MAX_ROOM_SUBSCRIBERS int64 = 2
const ID_KEY_EXPIRE time.Duration = 2 * 24 * time.Hour

var HEADER_BYTE_ORDER = binary.LittleEndian

// MessageHeader models a fixed-size header for Redis pubsub messages
type MessageHeader struct {
	ID int64 // sender id
	Mt int32 // ws message type
}

// RoomInfo models an update package for a user in a room
type RoomInfo struct {
	Polite  bool `json:"polite"`   // is the user polite?
	HasPair bool `json:"has_pair"` // does the user have a connected pair in the room?
}

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	app := fiber.New()

	// Websocket connection prerequirement middleware
	app.Use("/ws/:id", func(c *fiber.Ctx) error {
		// Disregard non websocket connections
		if !websocket.IsWebSocketUpgrade(c) {
			return fiber.ErrUpgradeRequired
		}

		id := c.Params("id")
		numbsub := rdb.PubSubNumSub(context.Background(), id)
		subscribers := numbsub.Val()[id]
		if subscribers >= MAX_ROOM_SUBSCRIBERS {
			return fiber.ErrForbidden
		}
		c.Locals("subscribers", subscribers)

		return c.Next()
	})

	// Websocket connection handler
	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		defer c.Close()

		// Get the room ID
		id := c.Params("id")

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		pubsub := rdb.Subscribe(ctx, id)
		defer pubsub.Close()

		ch := pubsub.Channel()

		// Number of subscribers, including the new member
		subscribers := c.Locals("subscribers").(int64) + 1

		count, err := rdb.Incr(ctx, id).Result()
		if err != nil {
			rdb.Set(ctx, id, 0, 0)
		}
		rdb.Expire(ctx, id, ID_KEY_EXPIRE)
		myHeader := MessageHeader{ID: count}

		roomInfo := RoomInfo{Polite: subscribers == 2, HasPair: subscribers > 1}
		if err := c.WriteJSON(roomInfo); err != nil {
			log.Println("sending initial room info error:", err)
			return
		}

		// Redis -> Websocket
		go func() {
			var (
				err    error
				header MessageHeader
				buf    bytes.Buffer
			)
			for {
				select {
				case <-ctx.Done():
					return
				case msg := <-ch:
					buf.Reset()
					if _, err := buf.WriteString(msg.Payload); err != nil {
						log.Println("payload read to buffer error:", err)
						continue
					}

					// Read byte header
					if err = binary.Read(&buf, HEADER_BYTE_ORDER, &header); err != nil {
						log.Println("header unpack error:", err)
						continue
					}

					// Ignore own messages
					if header.ID == myHeader.ID {
						continue
					}

					// Write message
					if err = c.WriteMessage(int(header.Mt), buf.Bytes()); err != nil {
						log.Println("write to redis channel error:", err)
						continue
					}
				}
			}
		}()

		// Websocket -> Redis
		var (
			mt  int
			r   io.Reader
			buf bytes.Buffer
		)
		for {
			// Read incoming websocket message
			if mt, r, err = c.NextReader(); err != nil {
				log.Println("error getting reader:", err)
				break
			}
			myHeader.Mt = int32(mt)

			buf.Reset()

			// Prepend write the byte header
			if err = binary.Write(&buf, HEADER_BYTE_ORDER, myHeader); err != nil {
				log.Println("header pack error:", err)
				continue
			}

			// Write message content
			if _, err = io.Copy(&buf, r); err != nil {
				log.Println("message read error:", err)
				continue
			}

			// Send message to pubsub channel
			if err := rdb.Publish(ctx, id, buf.Bytes()).Err(); err != nil {
				log.Println("message write error:", err)
				continue
			}
		}
	}))

	log.Fatal(app.Listen(":3000"))
}
