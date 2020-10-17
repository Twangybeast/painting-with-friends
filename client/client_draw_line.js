module.exports = function(data) {
  var line = data.line;
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo(line[0].x * width, line[0].y * height);
  ctx.lineTo(line[1].x * width, line[1].y * height);
  ctx.stroke();
}