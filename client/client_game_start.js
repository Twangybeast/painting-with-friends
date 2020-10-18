function setBackgroundColor(color) {
  document.documentElement.style.setProperty('--bg', color);
}

function listenForNewColorSelection(socket, config) {
  let els = document.querySelectorAll('.color-options .color-option');
  for (let i = 0; i < els.length; i++) {
    els[i].addEventListener('click', () => {
      config.color = config.colors[i];
      socket.emit('color_update', {
        color: config.color,
      });
    });
  }
}

const game_start = function (socket, data, config) {
  // model image
  const image = document.querySelector('img.model');
  // image name
  const imageTitle = document.querySelector('.model-image > h2');

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines = [];

  let me = data.me;

  let colors = data.players[me].colors;
  config.colors = colors;
  config.color = colors[0];
  setBackgroundColor(config.color);

  document.querySelector('.color-options').innerHTML = config.colors.map((c) => `<div class="color-option" style="background:${c}"></div>`).join('');
  document.querySelector('.color-options .color-option:first-child').classList.add('selected');
  listenForNewColorSelection(socket, config);
  socket.emit('color_update', {
    color: config.color,
  });

  let path = data.image_path;
  let stop_time = data.stop_time; //UNIX time of stop time
  let deadline = new Date(stop_time);
  new Timer().initializeClock('timer', deadline);
  image.src = path;
  imageTitle.textContent = data.image_name;
  // return data.players;
}
