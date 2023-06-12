package main

import (
	"fmt"
	"log"
	"sync/atomic"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// TODO: remove race conds (locks or chans?)
// TODO: Try using Redis with TTL

var rooms = make(map[string]*User)
var limc = make(chan struct{}, 1) // allow only one room operation at a time

// TODO: mutex per room instead of single channel (would allow parallel updates to different rooms)
type User struct {
	*websocket.Conn
	polite atomic.Bool
	pair   atomic.Pointer[User]
}

// RoomInfo models an update package for a user in a room
type RoomInfo struct {
	Polite  bool `json:"polite"`   // is the user polite?
	HasPair bool `json:"has_pair"` // does the user have a connected pair in the room?
}

func main() {
	app := fiber.New()

	// Websocket connection prerequirement middleware
	app.Use("/ws/:id", func(c *fiber.Ctx) error {
		// Disregard non websocket connections
		if !websocket.IsWebSocketUpgrade(c) {
			return fiber.ErrUpgradeRequired
		}

		return c.Next()
	})

	// Websocket connection handler
	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		defer c.Close()

		// Get the room ID
		id := c.Params("id")

		// Connect to room with the given ID
		user, ok := connectToRoom(id, c)
		if !ok {
			return
		}
		// Disconnect from room when connection is closed
		defer disconnectFromRoom(id, c)

		// Send the new user about the room information
		roomInfo := RoomInfo{Polite: user.polite.Load(), HasPair: user.pair.Load() != nil}
		if err := user.WriteJSON(roomInfo); err != nil {
			return
		}

		var (
			mt  int
			msg []byte
			err error
		)
		for {
			// Read incoming messages
			if mt, msg, err = c.ReadMessage(); err != nil {
				log.Println("read error:", err)
				break
			}

			pair := user.pair.Load()
			// If no other user or a reserved user (nil connection) is connected, disregard the message
			if pair == nil { //|| user.pair.Conn == nil {
				continue
			}
			// Send the message to the other user
			if err = pair.WriteMessage(mt, msg); err != nil {
				log.Println("write error:", err)
				break
			}
		}
	}))

	log.Fatal(app.Listen(":3000"))
}

// Attempt to connect a new user with the passed websocket connection to a room. A room with the passed ID is
// created if does not already exist. Returns false if the room is full, otherwise, a reference to the created
// user and true is returned.
func connectToRoom(id string, c *websocket.Conn) (*User, bool) {
	limc <- struct{}{}
	defer func() {
		<-limc
	}()

	user, ok := rooms[id]
	var newUser *User
	if !ok || user == nil {
		// Room does not exist or exists and is empty
		newUser = &User{c, atomic.Bool{}, atomic.Pointer[User]{}}
		newUser.polite.Store(true)
		newUser.pair.Store(nil)
		rooms[id] = newUser
	} else if user.pair.Load() == nil {
		// A user is waiting alone in the room
		// If pair is polite then be impolite, and vice versa
		newUser = &User{c, atomic.Bool{}, atomic.Pointer[User]{}}
		newUser.polite.Store(!user.polite.Load())
		newUser.pair.Store(user)
		user.pair.Store(newUser)
	} else {
		// Room is full
		return nil, false
	}
	return newUser, true
}

func disconnectFromRoom(id string, c *websocket.Conn) {
	limc <- struct{}{}
	defer func() {
		<-limc
	}()

	user, ok := rooms[id]
	if !ok || user == nil {
		return
	}

	pair := user.pair.Load()

	if user.Conn == c {
		if pair != nil {
			pair.pair.Store(nil)
		}

		user.pair.Store(nil)
		rooms[id] = pair
	} else if pair != nil && pair.Conn == c {
		pair.pair.Store(nil)
		user.pair.Store(nil)
	} else {
		fmt.Println("what (disconnect)?")
	}
}
