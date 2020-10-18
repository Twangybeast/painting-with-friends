// const config = {
// 	width: 1000,
// 	height: 500,
// 	color: "green", // user's color
// 	drawWidth: 10, // NOT scaled by DPR
// 	cursorRadius: 10 * dpr,
// 	cursorDownRadius: 8 * dpr,
// 	cursorColor: "#99aab5",
// 	cursorDownColor: "#7289da",
// 	cursorLineWidth: 5 * dpr,
// 	cursorDownLineWidth: 2 * dpr,
// };

const brushWidthInput = document.getElementById('brush-width');
const brushWidthOutput = document.querySelector('.brush-width');

brushWidthInput.addEventListener('change', (evt) => {
	const val = +evt.target.value;
	config.drawWidth = val;
	brushWidthOutput.innerHTML = val;
});
config.drawWidth = brushWidthInput.value;