function setBackgroundColor(color) {
  document.documentElement.style.setProperty('--bg', color);
}

const game_start = function (data, config) {
  // model image
  const image = document.querySelector('img.model');
  // image name
  const imageTitle = document.querySelector('.model-image > h2');

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines = [];

  let me = data.me;

  let color = data.players[me].color;

  setBackgroundColor(color);

  let path = data.image_path;
  let stop_time = data.stop_time; //UNIX time of stop time
  let deadline = new Date(stop_time);
  new Timer().initializeClock('timer', deadline);
  config.color = color;
  image.src = path;
  imageTitle.textContent = data.image_name;
  return data.players;
}
