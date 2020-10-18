module.exports = function(io) {
  return (data) => {
    io.emit('draw_line', { line: data.line });
  }
}