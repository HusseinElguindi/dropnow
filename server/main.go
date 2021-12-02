package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// TODO: remove race conds (locks or chans?)
// TODO: Try using Redis with TTL

var rooms = make(map[string]*User)

type User struct {
	*websocket.Conn
	pair *User
}

func main() {
	app := fiber.New()

	// Websocket connection prerequirement middleware
	app.Use("/ws/:id", func(c *fiber.Ctx) error {
		// Disregard non websocket connections
		if !websocket.IsWebSocketUpgrade(c) {
			return fiber.ErrUpgradeRequired
		}

		// Get the room ID
		id := c.Params("id")

		// Try to reserve a nil connection spot in the room
		user, ok := connectToRoom(id, nil)
		// Don't allow a connection if the room is full
		if !ok {
			return fiber.ErrForbidden
		}
		// Pass the reserved nil connection spot to be updated with the websocket connection
		c.Locals("user", user)

		return c.Next()
	})

	// Websocket connection handler
	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		// Get the room ID
		id := c.Params("id")

		// Get the reserved user spot
		user := c.Locals("user").(*User)
		// Update the nil connection with the current websocket connection
		user.Conn = c

		// Disconnect from room when connection is closed
		defer disconnectFromRoom(id, c)

		var (
			mt  int
			msg []byte
			err error
		)
		for {
			// Read incoming messages
			if mt, msg, err = c.ReadMessage(); err != nil {
				log.Println("read:", err)
				break
			}
			fmt.Println(string(msg))
			// If no other user or a reserved user (nil connection) is connected, disregard the message
			if user.pair == nil || user.pair.Conn == nil {
				continue
			}
			// Send the message to the other user
			if err = user.pair.WriteMessage(mt, msg); err != nil {
				log.Println("write:", err)
				break
			}
		}
	}))

	app.Static("/", "../client/public")
	app.Static("/*", "../client/public/index.html")

	log.Fatal(app.Listen(":3000"))
}

// Attempt to connect a new user with the passed websocket connection to a room. A room with the passed ID is
// created if does not already exist. Returns false if the room is full, otherwise, a reference to the created
// user and true is returned.
func connectToRoom(id string, c *websocket.Conn) (*User, bool) {
	user, ok := rooms[id]
	var newUser *User
	if !ok || user == nil {
		newUser = &User{c, nil}
		rooms[id] = newUser
	} else if user.pair == nil {
		newUser = &User{c, user}
		user.pair = newUser
	} else {
		return nil, false
	}
	return newUser, true
}

func disconnectFromRoom(id string, c *websocket.Conn) {
	user, ok := rooms[id]
	if !ok || user == nil {
		return
	}

	if user.Conn == c {
		user := user
		pair := user.pair

		if pair != nil {
			pair.pair = nil
		}

		user.pair = nil
		rooms[id] = pair
	} else if user.pair != nil && user.pair.Conn == c {
		user.pair = nil
	}
}
