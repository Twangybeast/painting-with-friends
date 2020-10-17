const SOCKET_URL = 'http://localhost:8000';
const socket = io(SOCKET_URL, { autoConnect: true });

const usersListEl = document.querySelector('.users-list ul');

socket.on('connect', () => {
	console.log('Connected to the server via socket');
});

socket.on('disconnect', (reason) => {
	console.log(`Connection to the server has been lost: ${reason}.`);
});

socket.on('users list', (data) => {
	console.log(data);
	usersListEl.innerHTML = data.map((u, i) => `<li>(${i+1}) ${u}</li>`).join('');
});
