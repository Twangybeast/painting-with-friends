const game_start = function (data) {
  // model image
  const image = document.querySelector('.model-image');

  var color = data.color;
  var path = data.image_path;
  var stop_time = data.stop_time; //UNIX time of stop time
  var deadline = new Date(stop_time);
  new Timer().initializeClock('timer', deadline);
  ctx.strokeStyle = color;
  image.src = path;
}
