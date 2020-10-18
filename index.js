const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const CLIENT_URL = 'http://localhost:3000';
const PORT = process.env.PORT || 8000;

app.use(cors({
	origin: CLIENT_URL,
}));

app.use(express.json());

app.use(express.static(__dirname + '/client'));

// list of connected members
const connectedSockets = [];

const rooms2sockets = {};
const roomInfos = {};

// import images
const image_manager = require('./image_manager')

// import socket functions
const { onGameStart, hasGameStarted } = require('./sockets/server_game_start');

io.on('connection', (socket) => {
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
	});
	socket.on('draw_line', (data) => {
		io.to(room).emit('draw_line', { line: data.line });
	})
});

function sendUsersUpdate(room) {
	if (rooms2sockets[room]) {
		io.to(room).emit('users_list', rooms2sockets[room].map((s) => ({
			id: s.id,
			isReady: s.isReady,
		})));
	}
}

http.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

app.post('/reset', function(req, res) {
	res.status(404).json({'data':'Reset not found'});
});
