function do_confetti() {
  var myCanvas = document.createElement('canvas');
  myCanvas.style.position = 'absolute'
  myCanvas.style.top = 0
  myCanvas.style.width = '100%'
  document.body.appendChild(myCanvas);

  var myConfetti = confetti.create(myCanvas, {
    resize: true,
    useWorker: true
  });
  myConfetti({
    particleCount: 500,
    startVelocity: 80,
    spread: 180,
    origin: {x: 0.5, y: 0.25}
    // any other options from the global
    // confetti function
  });

  setTimeout(() => {
    myConfetti.reset();
    document.body.removeChild(myCanvas)
  }, 5000);
}

const game_stop = function(data) {
  const imageTitle = document.querySelector('.model-image > h2');
  imageTitle.textContent = "ROUND OVER";
  clearInterval(intervalID);
  readyButton.classList.remove('hide');

  do_confetti()
}

