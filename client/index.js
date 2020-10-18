// const MY_URL = 'https://paintin.azurewebsites.net';
// const ROOM_URL = 'https://www.paintin.tech';

const MY_URL = 'http://localhost:8000';
const ROOM_URL = 'http://localhost:8000';

// handles name change as you type

const nameChange = document.getElementById("name-change");
const inputHandler = function (e) {
    localStorage.setItem('name', e.target.value);
}

nameChange.addEventListener('input', inputHandler);
nameChange.addEventListener('propertychange', inputHandler);
nameChange.value = localStorage.getItem('name');

function getHrefForRoom(roomName) {
    return MY_URL + "/foyer/" + encodeURIComponent(roomName);
}

function addCreateButton(dropDown) {
    let el = document.createElement("li");
    let roomName = generateName();
    el.innerHTML = `Create your own room (${roomName}) <a class='join-room' href='${getHrefForRoom(roomName)}'>Create</a>!`
    dropDown.appendChild(el);
}

//propagates the drop-down
const fetch_rooms = async (dropDown) => {
    fetch(MY_URL + "/open-rooms")
        .then(response => response.json())
        .then(data => {
            const rooms = data.rooms;
            addCreateButton(dropDown);

            rooms.forEach(element => {
                var el = document.createElement("li");
                var div = document.createElement("div");
                let innerHTML = `<span class='room-name'>Foyer <strong>${escapeHtml(element.room)}</strong></span><span>: ${element.current}/${element.max} players`;

                if (!element.started) {
                    innerHTML += ` <a class='join-room' href='${getHrefForRoom(element.room)}'>Join</a>`;
                }
                innerHTML += '</span>'
                div.innerHTML = innerHTML;

                el.appendChild(div);
                dropDown.appendChild(el);
            });
        });

};
const dropDown = document.getElementById("rooms");
fetch_rooms(dropDown);

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
