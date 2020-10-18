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

module.exports.hasGameStarted = () => hasGameStarted;

module.exports.onGameStart = function(socket, data, image_manager, connectedSockets) {
    console.log(`Client ${socket.id} is ready!`);
    socket.isReady = true;

    // wait until 4 players connect before starting the game
    let numReadySockets = connectedSockets.map((s) => s.isReady).filter((r) => r).length;
    if (numReadySockets < 4) {
        console.log(`Currently only ${numReadySockets} players are ready.`);
        return;
    }

    console.log(`Game has started!`);
    hasGameStarted = true;

    const image = image_manager.image_data[0];
    let stop_time = Date.now() + GAME_LENGTH
    let payload = {
        'image_path': image['path'],
        'image_name': image['name'],
        'players': [],
        'stop_time': stop_time
    }
    let ordering = [0, 1, 2, 3];
    shuffle(ordering)
    for (let i = 0; i < 4 && i < connectedSockets.length; i++) {
        let s = connectedSockets[i]
        payload['players'].push({
            'name': s.id,
            'color': image['colors'][ordering[i]][0]
        });
    }

    for (let i = 0; i < 4 && i < connectedSockets.length; i++) {
        payload['me'] = i;
        connectedSockets[i].emit('game_start', payload);
    }
    setTimeout(function () {
        for (let s of connectedSockets) {
            s.emit('game_end', {})
        }
    }, GAME_LENGTH);
}