const game_stop = function(data) {
  const imageTitle = document.querySelector('.model-image > h2');
  const clock = document.querySelector('.timer');

  imageTitle.textContent = "ROUND OVER";
  clock.textContent = "OUT OF TIME";
  clearInterval(intervalID);
  readyButton.classList.remove('hide');
}
