module.exports = function(data) {
  io.emit('draw_line', { line: data.line });
}