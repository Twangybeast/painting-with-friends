// handles name change as you type

const nameChange = document.getElementById("name-change");
const inputHandler = function (e) {
    sessionStorage.setItem('name', e.target.value);
    console.log(sessionStorage.getItem('name'));
}

nameChange.addEventListener('input', inputHandler);
nameChange.addEventListener('propertychange', inputHandler);

function addCreateButton(dropDown) {
    let el = document.createElement("li");
    let roomName = generateName();
    const href = "https://paintin.tech/room.html?room=" + encodeURIComponent(roomName);
    el.innerHTML = `Create your own room (${roomName}) <a class='join-room' href='${href}'>Create</a>!`
    dropDown.appendChild(el);
}

//propagates the drop-down
const fetch_rooms = async (dropDown) => {
    fetch("https://paintin.tech/open-rooms")
        .then(response => response.json())
        .then(data => {
            const rooms = data.rooms;
            addCreateButton(dropDown);

            rooms.forEach(element => {
                var el = document.createElement("li");
                var div = document.createElement("div");
                let innerHTML = `<span class='room-name'>Room <strong>${escapeHtml(element.room)}</strong></span><span>: ${element.current}/${element.max} players`;

                if (!element.started) {
                    const href = "http://paintin.tech/room.html?room=" + encodeURIComponent(element.room);
                    innerHTML += ` <a class='join-room' href='${href}'>Join</a>`;
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
