const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL, { autoConnect: true });

const usersListEl = document.querySelector('.users-list ul');

const canvas = document.querySelector('.drawing-canvas');
const ctx = canvas.getContext('2d');
const mouse = new MouseJS(canvas);

const config = {
	width: 1000,
	height: 500,
	cursorRadius: 10 * devicePixelRatio,
	cursorColor: "#99aab5",
	cursorLineWidth: 5 * devicePixelRatio,
};

// Scale for DPI
canvas.width = config.width * window.devicePixelRatio;
canvas.height = config.height * window.devicePixelRatio;
canvas.style.width = `${config.width}px`;
canvas.style.height = `${config.height}px`;

//model image
const image = document.querySelector('.model-image');

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
	let lis = data.filter((u) => u !== socket.id).map((u) => `<li>${u.substr(0, 5)}</li>`).join('');
	usersListEl.innerHTML = `<li>${socket.id.substr(0, 5)} (you)</li>${lis}`;
});

socket.on('draw_line', draw_line.bind(this));
socket.on('game_start', game_start.bind(this));
socket.on('game_stop', game_stop.bind(this));

function drawCursor() {
	ctx.save();
	ctx.beginPath();
	ctx.arc(mouse.x, mouse.y, config.cursorRadius, 0, 2 * Math.PI);
	ctx.strokeStyle = config.cursorColor;
	ctx.lineWidth = config.cursorLineWidth;
	ctx.stroke();
	ctx.restore();
}

function drawOnCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCursor();
}

function update() {
	requestAnimationFrame(update);
	drawOnCanvas();
}

update();
