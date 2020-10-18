let mouse = {x: 0, y: 0};
let scene, camera, renderer, clock, dpr;
let uniforms = {};

function onResize() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	dpr = window.devicePixelRatio || 1;
	renderer.setSize(w, h);
	renderer.setPixelRatio(dpr);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	uniforms.u_resolution.value.set(w * dpr, h * dpr);
}

function setup3d() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
	clock = new THREE.Clock();
	camera.position.z = 0.6;

	renderer = new THREE.WebGLRenderer({
		alpha: true,
	});
	renderer.domElement.classList.add('webgl');
	document.body.appendChild(renderer.domElement);

	uniforms = {
		u_resolution: { value: new THREE.Vector2() },
		u_mouse: { value: new THREE.Vector2() },
		u_time: { value: 0 },
	};

	window.addEventListener('resize', onResize, false);
	onResize();

	document.addEventListener('mousemove', (evt) => {
		mouse.x = evt.clientX;
		mouse.y = evt.clientY;
	}, { passive: true });

	scene.add(new THREE.Mesh(
		new THREE.PlaneGeometry(3, 1),
		new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		})
	));

	update();
}

function update() {
	requestAnimationFrame(update);
	uniforms.u_time.value = clock.getElapsedTime();
	uniforms.u_mouse.value.set(mouse.x * dpr, mouse.y * dpr);
	renderer.render(scene, camera);
}

setup3d();