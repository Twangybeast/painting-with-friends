const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const CLIENT_URL = 'https://www.paintin.tech';
const PORT = process.env.PORT || 8000;

app.use(cors({
	origin: CLIENT_URL,
}));

app.use(express.json());

const roomHTMLPath = path.resolve(__dirname + '/client/room.html');
let roomHTMLContent = fs.readFileSync(roomHTMLPath, 'utf8');
app.use(express.static(__dirname + '/client'));

// list of connected members
let connectedSockets = [];

let rooms2sockets = {};
let roomInfos = {};

// import images
const image_manager = require('./image_manager')

// import socket functions
const { onGameStart, hasGameStarted } = require('./sockets/server_game_start');

app.get('/open-rooms', (req, res) => {
	console.log('Got request for open-rooms');

	let result = [];
	for (let room of Object.keys(roomInfos)) {
		result.push({
			room,
			current: rooms2sockets[room].length,
			max: 4,
			started: roomInfos[room].started || false,
		});
	}

	console.log(result);

	res.send({
		rooms: result,
	});
});

app.get('/foyer/:id', (req, res) => {
	const id = req.params.id;
	res.send(roomHTMLContent.replace('ROOM_ID_REPLACED_BY_EXPRESS', id));
});

io.on('connection', (socket) => {
	socket.username = socket.handshake.query.name
	let room = socket.handshake.query.room
	// disallow more than 4 players or joining already started game
	// console.log(rooms2sockets[room])
	if (rooms2sockets[room] && (rooms2sockets[room].length === 4 || hasGameStarted(room, roomInfos))) {
		socket.disconnect();
		return;
	}

	if (!rooms2sockets[room]) {
		rooms2sockets[room] = []
		roomInfos[room] = {}
	}

	socket.isReady = false;
	socket.color = 'white';
	connectedSockets.push(socket);
	rooms2sockets[room].push(socket);
	socket.join(room)
	console.log(`New client ${socket.id} connected to room ${room}. Users: ${connectedSockets.length}`);
	sendUsersUpdate(room);

	socket.on('disconnect', () => {
		// remove from connectedSockets list
		const index = connectedSockets.indexOf(socket);
		if (index > -1) {
			connectedSockets.splice(index, 1);
		}
		// remove from rooms2sockets list
		if (rooms2sockets[room]) {
			const idx = rooms2sockets[room].indexOf(socket);
			if (idx > -1) {
				rooms2sockets[room].splice(index, 1)
				// delete room
				if (rooms2sockets[room].length === 0) {
					delete rooms2sockets[room]
					delete roomInfos[room]
				}
			}
		}

		console.log(`Client ${socket.id} disconnected froom room ${room}. Users: ${connectedSockets.length}`);
		sendUsersUpdate(room);
	});

	socket.on('game_start', (data) => {
		onGameStart(io, socket, data, image_manager, rooms2sockets[room], room, roomInfos);
		sendUsersUpdate(room);
		sendColorsUpdate(room);
	});
	socket.on('draw_line', (data) => {
		io.to(room).emit('draw_line', { line: data.line });
	})

	socket.on('new_name', (data) => {
		console.log(`Client ${socket.id} set their username to ${data.name}`);
		socket.username = data.name;
		sendUsersUpdate(room);
	})

	socket.on('mouse_move', (data) => {
		socket.mouseX = data.x;
		socket.mouseY = data.y;
		sendCursorsUpdate(room);
	})

	socket.on('color_update', (data) => {
		socket.color = data.color;
		sendColorsUpdate(room);
	})
});

function sendUsersUpdate(room) {
	if (rooms2sockets[room]) {
		io.to(room).emit('users_list', rooms2sockets[room].map((s) => ({
			name: s.username,
			id: s.id,
			isReady: s.isReady,
		})));
	}
}

function sendCursorsUpdate(room) {
	if (rooms2sockets[room]) {
		io.to(room).emit('mouse_move', rooms2sockets[room].map((s) => ({
			x: s.mouseX || 0,
			y: s.mouseY || 0,
			id: s.id
		})));
	}
}

function sendColorsUpdate(room) {
	if (rooms2sockets[room]) {
		io.to(room).emit('color_update', rooms2sockets[room].map((s) => s.color));
	}
}

http.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

app.get('/reset', function (req, res) {
	for (let s of connectedSockets) {
		s.disconnect();
	}
	connectedSockets = [];
	rooms2sockets = {};
	roomInfos = {};
	console.log('Reset!');
	res.send('Successfully reset');
});
