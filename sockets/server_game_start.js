const GAME_LENGTH = 1000 * 30;

module.exports = function(data) {
    const image = image_manager.image_data[0];
    let stop_time = Date.now() + GAME_LENGTH
    let payload = {
        'image_path': image['path'],
        'players': [],
        'stop_time': stop_time
    }
    for (let i = 0; i < 4; i++) {
        let s = connectedSockets[i]
        payload['players'].push({
           'name': s.id,
            'color': image['colors'][i][0]
        });
    }
    for (let i = 0; i < 4; i++) {
        payload['me'] = i;
        socket.emit('game_start', payload);
    }
    setTimeout(function() {
        let s;
        for (s of connectedSockets) {
            s.emit('game_end', {})
        }
    }, GAME_LENGTH);
}