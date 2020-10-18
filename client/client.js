const room = new URLSearchParams(window.location.search).get('room') || 'xz1kdfj'
let name = sessionStorage.getItem('name')
if (!name) {
	name = 'Player#' + Math.floor(Math.random() * 1000 + 1)
	sessionStorage.setItem('name', name)
}
const SOCKET_URL = 'http://localhost:8000?room=' + room + '&name=' + encodeURIComponent(name);
const socket = io(SOCKET_URL, { autoConnect: true});

const usersListEl = document.querySelector('.users-list ul');
const readyButton = document.querySelector('.ready-button');
var intervalID;
const canvas = document.querySelector('.drawing-canvas');
const ctx = canvas.getContext('2d');
const mouse = new MouseJS(canvas);
let prevPos = {x: -1, y: -1}; // previous mouse position (updated every few msec)
const dpr = window.devicePixelRatio; // needed to fix blurriness for high DPI displays

const config = {
	name: '', // TODO
	width: 1000,
	height: 500,
	color: "green", // user's color
	drawWidth: 10, // NOT scaled by DPR
	drawOpacity: 1, // range of 0 to 1
	cursorColor: "#99aab5",
	cursorDownColor: "#7289da",
	cursorLineWidth: 5 * dpr,
	cursorDownLineWidth: 2 * dpr,
};
console.log(dpr);

// Scale for DPI
let width = canvas.width = config.width * dpr;
let height = canvas.height = config.height * dpr;
canvas.style.width = `${config.width}px`;
canvas.style.height = `${config.height}px`;

socket.on('connect', () => {
	console.log('Connected to the server via socket');
});

socket.on('disconnect', (reason) => {
	console.log(`Connection to the server has been lost: ${reason}.`);
	document.querySelector('.disconnected-banner').classList.add('show');
});

socket.on('users_list', (data) => {
	console.log(data);
	usersListEl.innerHTML = data.map((u) => {
		let text = u.name || u.id;
		let classList = '';
		if (!u.isReady) {
			classList = 'not-ready';
		}
		if (u.id === socket.id) {
			classList += ' you'
		}
		return `<li class="${classList}">${text}</li>`;
	}).join('');
});

socket.on('game_start', (data) => {
	game_start(data, config);
	intervalID = setInterval(checkForLines, 10);
});
socket.on('game_stop', game_stop.bind(this));

readyButton.addEventListener('click', () => {
	socket.emit('game_start', {
		name: socket.id,
	});
	readyButton.classList.add('hide');
})

let lines = [];

socket.on('draw_line', (data) => {
	lines.push(data.line);
});

function drawCursor() {
	ctx.save();
	ctx.beginPath();
	let isDrawing = mouse.left.clickTime > mouse.left.releaseTime;
	let radius = config.drawWidth * dpr / 2;
	ctx.strokeStyle = isDrawing ? config.cursorDownColor : config.cursorColor;
	ctx.lineWidth = isDrawing ? config.cursorDownLineWidth : config.cursorLineWidth;
	ctx.arc(mouse.x, mouse.y, radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}

function drawLines() {
	ctx.save();
	ctx.lineCap = "round";
	for (let line of lines) {
		ctx.beginPath();
		ctx.moveTo(line.start[0] * dpr, line.start[1] * dpr);
		ctx.lineTo(line.end[0] * dpr, line.end[1] * dpr);
		ctx.strokeStyle = line.color;
		ctx.lineWidth = line.width * dpr;
		ctx.globalAlpha = line.opacity;
		ctx.stroke();
	}
	ctx.restore();
}

function drawOnCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawLines();
	drawCursor();
}

function checkForLines() {
	if (mouse.left.clickTime <= mouse.left.releaseTime) {
		prevPos = {x: -1, y: -1};
		return;
	}

	if (prevPos.x === mouse.x && prevPos.y === mouse.y) {
		return;
	}

	if (prevPos.x !== -1) {
		let newLine = {
			start: [prevPos.x, prevPos.y],
			end: [mouse.x / dpr, mouse.y / dpr],
			color: config.color,
			width: config.drawWidth,
			opacity: config.drawOpacity,
		};
		socket.emit('draw_line', { line: newLine });
	}
	prevPos.x = mouse.x / dpr;
	prevPos.y = mouse.y / dpr;
}

function update() {
	requestAnimationFrame(update);
	drawOnCanvas();
}

const brushInput = document.getElementById('brush-width');
window.addEventListener('wheel', function(e) {
	let newValue = parseInt(brushInput.value) + (e.deltaY * -0.02);
	newValue = Math.min(Math.max(brushInput.min, newValue), brushInput.max);
	brushInput.value = newValue;
	brushInput.dispatchEvent(new Event('change'))
});

update();
