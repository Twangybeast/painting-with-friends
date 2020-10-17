const game_start = function(data) {
  var color = data.color;
  var path = data.image_path;
  var stop_time = data.stop_time; //UNIX time of stop time

  ctx.strokeStyle = color;
  image.src = path;
}