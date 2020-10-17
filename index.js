const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 8000;

app.use(cors({
	origin: 'http://localhost:3000',
}));

app.use(express.json());

app.use(express.static(__dirname + '/client'));

http.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});