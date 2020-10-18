// handles name change as you type

const nameChange = document.getElementById("name-change");
const inputHandler = function (e) {
    sessionStorage.setItem('name', e.target.value);
    console.log(sessionStorage.getItem('name'));
}

nameChange.addEventListener('input', inputHandler);
nameChange.addEventListener('propertychange', inputHandler);

//propagates the drop-down
const fetch_rooms = async (dropDown) => {
    fetch("http://localhost:8000/open-rooms")
        .then(response => response.json())
        .then(data => {
            const rooms = data.rooms;
            rooms.forEach(element => {
                var el = document.createElement("li");
                var div = document.createElement("div");
                div.innerHTML = "Room " + element.room + ": " + element.current + " of " + element.max + " Players";
                if (!element.started) {
                    var buttonEl = document.createElement("a");
                    buttonEl.style.marginLeft = "20px";
                    buttonEl.href = "http://localhost:8000/room.html?room=" + encodeURIComponent(element.room)
                    var buttonTextEl = document.createElement("span");
                    //TODO update class
                    //buttonTextEl.className = "picon-p-add-news"; <-- add styling class here
                    buttonTextEl.innerText = "Join Room!";
                    buttonEl.appendChild(buttonTextEl);
                    div.appendChild(buttonEl);
                }
                el.appendChild(div);
                dropDown.appendChild(el);
            });
        });

};
const dropDown = document.getElementById("rooms");
fetch_rooms(dropDown);

