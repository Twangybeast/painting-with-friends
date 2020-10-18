const brushWidthInput = document.getElementById('brush-width');
const brushWidthOutput = document.querySelector('.brush-width');
const opacityInput = document.getElementById('opacity');
const opacityOutput = document.querySelector('.opacity');

brushWidthInput.addEventListener('change', (evt) => {
	const val = +evt.target.value;
	config.drawWidth = val;
	brushWidthOutput.innerHTML = val;
});
config.drawWidth = +brushWidthInput.value;

opacityInput.addEventListener('change', (evt) => {
	const val = +evt.target.value;
	config.drawOpacity = val / 100;
	opacityOutput.innerHTML = val;
});
config.drawOpacity = +opacityInput.value / 100;