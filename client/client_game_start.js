const game_start = function(data) {
  var color = data.color;
  var path = data.image_path;
  var stop_time = data.stop_time; //UNIX time of stop time
  var deadline = new Date(Date.parse(new Date()) + 60 * 60 * 1000);
  Timer.initializeClock('timer', deadline);
  ctx.strokeStyle = color;
  image.src = path;
}
