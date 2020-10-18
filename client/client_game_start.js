const game_start = function (data, config) {
  // model image
  const image = document.querySelector('img.model');

  let me = data.me;

  let color = data.players[me].color;
  let path = data.image_path;
  let stop_time = data.stop_time; //UNIX time of stop time
  let deadline = new Date(stop_time);
  new Timer().initializeClock('timer', deadline);
  config.color = color;
  image.src = path;

  return data.players;
}
