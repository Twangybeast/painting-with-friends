let name = localStorage.getItem('name');
console.log(name);
if (!name) {
	name = 'Player#' + Math.floor(Math.random() * 1000 + 1)
}
const MY_URL = 'http://localhost:8000'
// const MY_URL = 'https://paintin.azurewebsites.net'
const SOCKET_URL = MY_URL + '?room=' + room + '&name=' + encodeURIComponent(name);
const socket = io(SOCKET_URL);

const usersListEl = document.querySelector('.users-list ul');
const readyButton = document.querySelector('.ready-button');
var intervalID;
const canvas = document.querySelector('.drawing-canvas');
const ctx = canvas.getContext('2d');
const mouse = new MouseJS(canvas);
let prevPos = {x: -1, y: -1}; // previous mouse position (updated every few msec)
const dpr = window.devicePixelRatio; // needed to fix blurriness for high DPI displays
let playersToColors = []; // maps player index to their current color
let playerToPalette = []
let cursors = []; // a list of {x, y, id}

let hideCursors = false;

const config = {
	name: '', // TODO
	width: 1000,
	height: 500,
	colors: ["white"], // user's selection of colors
	color: "white", // user's current color
	drawWidth: 10, // NOT scaled by DPR
	drawOpacity: 1, // range of 0 to 1
	cursorColor: "#99aab5",
	cursorDownColor: "#7289da",
	cursorLineWidth: 5 * dpr,
	cursorDownLineWidth: 2 * dpr,
	otherCursorWidth: 6 * dpr,
};

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


function getPaletteBackground(colors) {
    if (!colors) {
        return `background:${'transparent'};`;
    } else {
        if (colors.length === 1) {
            return `background:${colors[0]};`;
        } else if (colors.length === 2) {
            return `background: linear-gradient(110deg, ${colors[0]} 0%, ${colors[0]} 48%, ${colors[1]} 52%);`
        } else {
            if (colors.length !== 3) {
                console.log(`Unexpected colors [${colors}] of length ${colors.length}`)
            }
            return `background: linear-gradient(110deg, ${colors[0]} 0%, ${colors[0]} 31%, `
                + `${colors[1]} 35%, ${colors[1]} 64%, ${colors[2]} 68%);`
        }
    }
}

function getColorBorder(color) {
    return `2px solid ${color}`
}

socket.on('users_list', (data) => {
	console.log(data);
	usersListEl.innerHTML = data.map((u, i) => {
		let text = u.name || u.id;
		let classList = u.isReady ? 'ready' : 'not-ready';
		if (u.id === socket.id) {
			classList += ' you'
		}
		let color = playersToColors[i] || 'transparent';
		let palette = playerToPalette[i];
		let colorSpan = `<span class="color-block" style="${getPaletteBackground(palette)};border:${getColorBorder(color)}"></span>`;
		return `<li class="${classList}">${colorSpan}${text}</li>`;
	}).join('');

	// set name
	usersListEl.querySelector('.you').addEventListener('click', () => {
		let newName = prompt(`Set your name (currently ${name}):`);
		if (newName) {
			name = newName;
			localStorage.setItem('name', name);
			socket.emit('new_name', {
				name,
			});
		}
	});
});

socket.on('game_start', (data) => {
	game_start(socket, data, config);
	const playerEls = document.querySelectorAll('.users-list li');
	for (let i = 0; i < playerEls.length; i++) {
		playerEls[i].classList.remove('ready');
	}

	hideCursors = false;
	intervalID = setInterval(checkForLines, 10);
});
socket.on('game_stop', (data) => {
	game_stop(data);
	cursors = [];
	hideCursors = true;
});
socket.on('color_update', (data) => {
	const colorBlocks = document.querySelectorAll('.users-list .color-block');
	playersToColors = data;
	for (let i = 0; i < playersToColors.length; i++) {
		colorBlocks[i].style.border = getColorBorder(playersToColors[i]);
	}
});

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

socket.on('mouse_move', (data) => {
	cursors = data;
});

function drawCursor() {
	ctx.save();
	ctx.beginPath();
	let isDrawing = mouse.left.clickTime > mouse.left.releaseTime;
	let radius = config.drawWidth * dpr / 2;
	ctx.strokeStyle = isDrawing ? config.cursorDownColor : config.cursorColor;
	ctx.lineWidth = config.cursorDownLineWidth;
	if (!isDrawing) {
		ctx.lineWidth = (Math.sin(mouse.getTime() / 300) + 1) * config.cursorLineWidth / 2 + 5;
	}
	radius += ctx.lineWidth / 2;
	ctx.arc(mouse.x, mouse.y, radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}

function drawOtherCursors() {
	let radius = (Math.cos(mouse.getTime() / 300) + 1) / 2 * config.otherCursorWidth / 2 + config.otherCursorWidth / 2;
	ctx.save();
	for (let i = 0; i < cursors.length; i++) {
		let cursor = cursors[i];
		if (cursor.id !== socket.id) {
			ctx.beginPath();
			ctx.fillStyle = playersToColors[i];
			ctx.arc(cursor.x, cursor.y, radius, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
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
	if (!hideCursors) {
		drawCursor();
		drawOtherCursors();
	}
}

function checkForLines() {
	if (prevPos.x === mouse.x && prevPos.y === mouse.y) {
		return;
	}

	socket.emit('mouse_move', { x: mouse.x, y: mouse.y });

	if (mouse.left.clickTime <= mouse.left.releaseTime) {
		prevPos = {x: -1, y: -1};
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
