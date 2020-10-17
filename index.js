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

// import socket functions
const game_start = require('./sockets/server_game_start')
const draw_line = require('./sockets/server_draw_line')

io.on('connection', (socket) => {
	connectedSockets.push(socket);
	console.log(`New client ${socket.id} connected. Users: ${connectedSockets.length}`);
	sendUsersUpdate();

	socket.on('disconnect', () => {
		// remove from connectedSockets list
		const index = connectedSockets.indexOf(socket);
		if (index > -1) {
			connectedSockets.splice(index, 1);
		}

		console.log(`Client ${socket.id} disconnected. Users: ${connectedSockets.length}`);
		sendUsersUpdate();
	});

	socket.on('game_start', game_start.bind(this))
	socket.on('draw_line', draw_line.bind(this))
});

function sendUsersUpdate() {
	io.emit('users list', connectedSockets.map((s) => s.id));
}

http.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

app.post('/reset', function(req, res) {
	res.status(404).json({'data':'Reset not found'});
});
