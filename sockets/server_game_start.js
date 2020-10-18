const GAME_LENGTH = 1000 * 30;

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

module.exports = function(image_manager, connectedSockets) {
    return (data) => {
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
        for (let i = 0; i < 4; i++) {
            let s = connectedSockets[i]
            payload['players'].push({
                'name': s.id,
                'color': image['colors'][ordering[i]][0]
            });
        }
        for (let i = 0; i < 4; i++) {
            payload['me'] = i;
            socket.emit('game_start', payload);
        }
        setTimeout(function () {
            let s;
            for (s of connectedSockets) {
                s.emit('game_end', {})
            }
        }, GAME_LENGTH);
    }
}