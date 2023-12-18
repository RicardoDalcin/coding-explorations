import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

export function earth(container: HTMLElement, canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const gui = new GUI();

  const loader = new THREE.TextureLoader();
  const displacement = loader.load('/textures/earth_height_map.jpg');

  // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLight);

  // const pointLight = new THREE.PointLight(0xffffff, 0.9);
  // pointLight.position.set(2, 3, 4);
  // scene.add(pointLight);

  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  // directionalLight.position.set(5, 5, 5);
  // scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
  directionalLight.position.set(1, 0.25, 0);
  scene.add(directionalLight);

  // Hemisphere light
  const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 3);
  scene.add(hemisphereLight);

  // Point light
  const pointLight = new THREE.PointLight(0xff9000, 1.5);
  pointLight.position.set(1, -0.5, 1);
  scene.add(pointLight);

  // Rect area light
  const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
  rectAreaLight.position.set(-1.5, 0, 1.5);
  rectAreaLight.lookAt(new THREE.Vector3());
  scene.add(rectAreaLight);

  // Spot light
  const spotLight = new THREE.SpotLight(
    0x78ff00,
    4.5,
    10,
    Math.PI * 0.1,
    0.25,
    1
  );
  spotLight.position.set(0, 2, 3);
  spotLight.target.position.x = -0.75;
  scene.add(spotLight);

  spotLight.target.position.x = -0.75;
  scene.add(spotLight.target);

  // Helpers
  const hemisphereLightHelper = new THREE.HemisphereLightHelper(
    hemisphereLight,
    0.2
  );
  scene.add(hemisphereLightHelper);

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    0.2
  );
  scene.add(directionalLightHelper);

  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(pointLightHelper);

  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);

  const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
  scene.add(rectAreaLightHelper);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 'blue',
    displacementMap: displacement,
    displacementScale: 0.2,
    roughness: 0.4,
  });
  const cube = new THREE.Mesh(geometry, material);

  const cubeTweak = gui.addFolder('Cube');

  cubeTweak.add(cube.position, 'x').min(-3).max(3).step(0.01);
  cubeTweak.add(cube.position, 'y').min(-3).max(3).step(0.01);
  cubeTweak.add(cube.position, 'z').min(-3).max(3).step(0.01);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
  plane.rotation.x = -Math.PI * 0.5;
  plane.position.y = -1.25;

  scene.add(cube, plane);

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.position.z = 5;

  window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  });

  container.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  });

  const axesHelper = new THREE.AxesHelper();
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  function animate() {
    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  animate();

  return () => {
    renderer.dispose();
    controls.dispose();
    window.removeEventListener('resize', () => {});
    container.removeEventListener('dblclick', () => {});
  };
}
