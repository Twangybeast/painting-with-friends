const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL, { autoConnect: true });

const usersListEl = document.querySelector('.users-list ul');

const canvas = document.querySelector('.drawing-canvas');
const ctx = canvas.getContext('2d');

// TODO: make this work with resized windows
let width = canvas.width;
let height = canvas.height;

socket.on('connect', () => {
	console.log('Connected to the server via socket');
});

socket.on('disconnect', (reason) => {
	console.log(`Connection to the server has been lost: ${reason}.`);
});

socket.on('users list', (data) => {
	console.log(data);
	let lis = data.filter((u) => u !== socket.id).map((u) => `<li>${u.substr(0,5)}</li>`).join('');
	usersListEl.innerHTML = `<li>${socket.id.substr(0,5)} (you)</li>${lis}`;
});

socket.on('draw_line', draw_line.bind(this));
socket.on('game_start', game_start.bind(this));
socket.on('game_stop', game_stop.bind(this));

function drawOnCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
	requestAnimationFrame(update);
	drawOnCanvas();
}
update();