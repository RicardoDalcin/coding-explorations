import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { Boid } from './Boid';

const CONTAINER_SIZE = 8;

function getRendering(
  scene: THREE.Scene,
  canvas: HTMLCanvasElement,
  container: HTMLElement
) {
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

  return { camera, renderer, controls };
}

function setupSceneBase(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
  directionalLight.position.set(1, 0.25, 0);
  scene.add(directionalLight);

  // Point light
  const pointLight = new THREE.PointLight(0xff9000, 1.5);
  pointLight.position.set(1, -0.5, 1);
  scene.add(pointLight);

  // Rect area light
  const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
  rectAreaLight.position.set(-1.5, 0, 1.5);
  rectAreaLight.lookAt(new THREE.Vector3());
  scene.add(rectAreaLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    0.2
  );
  scene.add(directionalLightHelper);

  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(pointLightHelper);

  const standardMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    roughness: 0.4,
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    standardMaterial
  );
  plane.rotation.x = -Math.PI * 0.5;
  plane.position.y = -5.25;

  scene.add(plane);
}

function getContainer(scene: THREE.Scene, gui: GUI) {
  const geometry = new THREE.BoxGeometry(
    CONTAINER_SIZE,
    CONTAINER_SIZE,
    CONTAINER_SIZE
  );
  const material = new THREE.MeshPhysicalMaterial({
    color: 'white',
    roughness: 0.1,
    transparent: true,
    transmission: 0.95,
    opacity: 0.5,
    reflectivity: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });

  const container = new THREE.Mesh(geometry, material);
  // scene.add(container);
  const planeGeometry = new THREE.PlaneGeometry(CONTAINER_SIZE, CONTAINER_SIZE);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 'blue',
    roughness: 0.4,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.z = -0.1;
  scene.add(plane);

  const cubeTweak = gui.addFolder('Cube');

  cubeTweak.add(container.position, 'x').min(-3).max(3).step(0.01);
  cubeTweak.add(container.position, 'y').min(-3).max(3).step(0.01);
  cubeTweak.add(container.position, 'z').min(-3).max(3).step(0.01);

  return container;
}

function spawnBoids(
  quantity: number,
  scene: THREE.Scene,
  container: THREE.Mesh,
  boidSettings: Settings
) {
  const COLORS = ['#ff0051', '#f56762', '#a53c6c', '#f19fa0', '#72bdbf'];
  const geometry = new THREE.ConeGeometry(0.1, 0.3, 3);
  const material = new THREE.MeshBasicMaterial({ color: 'white' });
  const highlightedMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });

  const boids = [];
  let hightlightedBoid: Boid | null = null;

  for (let i = 0; i < quantity; i++) {
    const mesh =
      i === 0
        ? new THREE.Mesh(geometry, highlightedMaterial)
        : new THREE.Mesh(geometry, material);

    const x = container.position.x + Math.random() * CONTAINER_SIZE - 4;
    const y = container.position.y + Math.random() * CONTAINER_SIZE - 4;
    // const z = container.position.z + Math.random() * CONTAINER_SIZE - 4;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    mesh.position.set(x, y, 0);
    scene.add(mesh);

    const boid = new Boid(mesh, scene, boidSettings, i === 0);
    boids.push(boid);

    if (i === 0) {
      hightlightedBoid = boid;
    }
  }

  return { boids, hightlightedBoid: hightlightedBoid! };
}

function getBoidDirection(boid: THREE.Mesh) {
  // get the vector that points to the tip of the cone
  const direction = new THREE.Vector3();

  const localTipPosition = new THREE.Vector3(0, 0.3 / 2, 0);
  const worldTipPosition = localTipPosition.applyMatrix4(boid.matrixWorld);

  direction.subVectors(worldTipPosition, boid.position);
  direction.normalize();
  direction.multiplyScalar(0.005);

  return direction;
}

function isBoidInCircle(
  boid: THREE.Mesh,
  direction: THREE.Vector3,
  distance: number,
  angle: number
) {
  const boidDirection = getBoidDirection(boid);

  const angleBetween = boidDirection.angleTo(direction);

  if (angleBetween > angle) {
    return false;
  }

  const boidDistance = boid.position.distanceTo(direction);

  if (boidDistance > distance) {
    return false;
  }

  return true;
}

function separation(boid: Boid, boids: Boid[]) {
  const boidsInView = boids.filter((otherBoid) => {
    if (otherBoid.id === boid.id) {
      return false;
    }

    return isBoidInCircle(otherBoid.mesh, boid.mesh.position, 0.5, Math.PI / 2);
  });

  if (boidsInView.length === 0) {
    return;
  }

  let dX = 0;
  let dY = 0;

  const initialRotation = boid.mesh.rotation.z;
  const boidDirectionX = Math.cos(initialRotation);
  const boidDirectionY = Math.sin(initialRotation);

  boidsInView.forEach((otherBoid) => {
    const otherDirectionX = Math.cos(otherBoid.mesh.rotation.z);
    const otherDirectionY = Math.sin(otherBoid.mesh.rotation.z);

    dX += boidDirectionX - otherDirectionX;
    dY += boidDirectionY - otherDirectionY;
  });

  dX *= settings.avoidanceFactor;
  dY *= settings.avoidanceFactor;

  const newRotation = Math.atan2(dY, dX);

  const angleBetween = Math.abs(newRotation - initialRotation);

  if (angleBetween > Math.PI / 180) {
    boid.mesh.rotation.z =
      (Math.PI / 60) * Math.sign(angleBetween) + initialRotation;
    return;
  }

  boid.mesh.rotation.z = newRotation;
}

export type Settings = {
  speed: number;
  turnSpeed: number;
  viewAngle: number;
  viewDistance: number;
  avoidanceFactor: number;
};

export function boids(
  containerElement: HTMLElement,
  canvas: HTMLCanvasElement
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#03f0fc');
  const gui = new GUI();

  const boidSettings: Settings = {
    speed: 0.2,
    turnSpeed: 0.01,
    viewAngle: Math.PI * 0.5,
    viewDistance: 0.5,
    avoidanceFactor: 0.01,
  };

  setupSceneBase(scene);

  const container = getContainer(scene, gui);

  const { controls, renderer, camera } = getRendering(
    scene,
    canvas,
    containerElement
  );

  const { boids, hightlightedBoid } = spawnBoids(
    100,
    scene,
    container,
    boidSettings
  );

  if (!hightlightedBoid) {
    throw new Error('No hightlighted boid');
  }

  let lastFrame = Date.now();

  const debug = {
    fps: 0,
  };

  gui.add(debug, 'fps').listen();

  const boidTweak = gui.addFolder('Boid');

  boidTweak.add(boidSettings, 'speed').min(0).max(0.5).step(0.001);
  boidTweak.add(boidSettings, 'turnSpeed').min(0).max(0.1).step(0.001);

  const viewPieGeometry = new THREE.CircleGeometry(
    boidSettings.viewDistance,
    32,
    0,
    boidSettings.viewAngle
  );

  const viewPieMaterial = new THREE.MeshBasicMaterial({
    color: 'yellow',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
  });

  const viewPie = new THREE.Mesh(viewPieGeometry, viewPieMaterial);

  boidTweak
    .add(boidSettings, 'viewAngle')
    .min(0)
    .max(Math.PI * 2)
    .step(0.001)
    .onChange((value: number) => {
      console.log(boidSettings.viewAngle);
      viewPie.geometry.dispose();
      viewPie.geometry = new THREE.CircleGeometry(
        boidSettings.viewDistance,
        32,
        0,
        value
      );
    });
  boidTweak
    .add(boidSettings, 'viewDistance')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange((value) => {});
  boidTweak.add(boidSettings, 'avoidanceFactor').min(0).max(0.5).step(0.001);

  scene.add(viewPie);

  function animate() {
    controls.update();

    const now = Date.now();
    const delta = now - lastFrame;
    lastFrame = now;
    const fps = 1000 / delta;

    // show fps on gui
    debug.fps = Math.round(fps);

    boids.forEach((boid) => {
      boid.update(boids);

      // const direction = getBoidDirection(boid);
      // direction.multiplyScalar(delta * 0.2);
      // boid.position.add(direction);
      // if (boid.position.x > CONTAINER_SIZE / 2) {
      //   boid.position.x = -(CONTAINER_SIZE / 2);
      // }
      // if (boid.position.x < -(CONTAINER_SIZE / 2)) {
      //   boid.position.x = CONTAINER_SIZE / 2;
      // }
      // if (boid.position.y > CONTAINER_SIZE / 2) {
      //   boid.position.y = -(CONTAINER_SIZE / 2);
      // }
      // if (boid.position.y < -(CONTAINER_SIZE / 2)) {
      //   boid.position.y = CONTAINER_SIZE / 2;
      // }
      // if (boid.position.z > CONTAINER_SIZE / 2) {
      //   boid.position.z = -(CONTAINER_SIZE / 2);
      // }
      // if (boid.position.z < -(CONTAINER_SIZE / 2)) {
      //   boid.position.z = CONTAINER_SIZE / 2;
      // }
      // if (boid.uuid === hightlightedBoid?.uuid) {
      //   // drawDebug(boid, direction);
      //   viewPie.position.copy(boid.position);
      //   viewPie.position.z = 0.01;
      //   // z needs to point in the same direction as the tip of the cone
      //   viewPie.rotation.z =
      //     Math.atan2(direction.y, direction.x) - boidSettings.viewAngle / 2;
      //   viewPie.rotation.x = boid.rotation.x;
      //   viewPie.rotation.y = boid.rotation.y;
      // }
      // separation(boid, boids);
      // boid.rotation.z += (Math.random() - 0.5) * delta * 0.01;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  return () => {
    renderer.dispose();
    controls.dispose();
    scene.clear();
    window.removeEventListener('resize', () => {});
    containerElement.removeEventListener('dblclick', () => {});
  };
}
