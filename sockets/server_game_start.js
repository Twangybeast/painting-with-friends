const GAME_LENGTH = 1000 * 30;

let hasGameStarted = false;

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports.hasGameStarted = (room, roomInfos) => {
    return !!(!roomInfos[room] || roomInfos[room]['started']);
}

module.exports.onGameStart = function(io, socket, data, image_manager, roomSockets, room, roomInfos) {
    console.log(`Client ${socket.id} is ready in room ${room}!`);
    socket.isReady = true;

    // wait until 4 players connect before starting the game
    let numReadySockets = roomSockets.map((s) => s.isReady).filter((r) => r).length;
    if (numReadySockets < 4) {
        console.log(`Currently only ${numReadySockets} players are ready in room ${room}.`);
        return;
    }

    console.log(`Game has started in room ${room}!`);
    roomInfos[room]['started'] = true;

    const image = image_manager.image_data[Math.floor(Math.random() * image_manager.image_data.length)];
    let stop_time = Date.now() + GAME_LENGTH
    let payload = {
        'image_path': image['path'],
        'image_name': image['name'],
        'players': [],
        'stop_time': stop_time
    }
    let ordering = [0, 1, 2, 3];
    shuffle(ordering)
    for (let i = 0; i < 4 && i < roomSockets.length; i++) {
        let s = roomSockets[i]
        payload['players'].push({
            'name': s.id,
            'colors': image['colors'][ordering[i]]
        });
    }

    for (let i = 0; i < 4 && i < roomSockets.length; i++) {
        payload['me'] = i;
        roomSockets[i].emit('game_start', payload);
    }
    setTimeout(function () {
        io.to(room).emit('game_stop', {})
        if (roomInfos[room]) {
            roomInfos[room]['started'] = false;
        }
        // reset back to not ready
        for (let i = 0; i < 4 && i < roomSockets.length; i++) {
            roomSockets[i].isReady = false;
        }
    }, GAME_LENGTH);
}
