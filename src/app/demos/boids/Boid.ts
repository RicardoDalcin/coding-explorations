import * as THREE from 'three';
import { Settings } from './boids';

export class Boid {
  private _mesh: THREE.Mesh;
  private _velocity: THREE.Vector3;
  private _direction: THREE.Vector3;
  private _scene: THREE.Scene;
  private _settings: Settings;
  private _isDebug = false;

  private _proximityLine: THREE.InstancedMesh | null = null;

  constructor(
    mesh: THREE.Mesh,
    scene: THREE.Scene,
    settings: Settings,
    isDebug = false
  ) {
    this._mesh = mesh;
    this._velocity = new THREE.Vector3();
    this._direction = new THREE.Vector3(
      Math.cos(mesh.rotation.z),
      Math.sin(mesh.rotation.z),
      0
    );
    this._scene = scene;
    this._settings = settings;
    this._isDebug = isDebug;

    if (this._isDebug) {
      const material = new THREE.LineBasicMaterial({
        color: 0xffff00,
      });
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 1, 0),
      ]);

      this._proximityLine = new THREE.InstancedMesh(geometry, material, 0);
      this._scene.add(this._proximityLine);
    }
  }

  get velocity() {
    return this._velocity;
  }

  set velocity(velocity: THREE.Vector3) {
    this._velocity = velocity;
  }

  get direction() {
    return this._direction;
  }

  set direction(direction: THREE.Vector3) {
    this._direction = direction;
    const angle = Math.atan2(direction.y, direction.x);
    this.mesh.rotation.z = angle;
  }

  get id() {
    return this.mesh.id;
  }

  get mesh() {
    return this._mesh;
  }

  getBoidDirection(boid: THREE.Mesh) {
    // get the vector that points to the tip of the cone
    const direction = new THREE.Vector3();

    const localTipPosition = new THREE.Vector3(0, 0.3 / 2, 0);
    const worldTipPosition = localTipPosition.applyMatrix4(boid.matrixWorld);

    direction.subVectors(worldTipPosition, boid.position);
    direction.normalize();

    return direction;
  }

  isBoidInView(boid: Boid) {
    const direction = this.getBoidDirection(this.mesh);
    const distance = this._settings.viewDistance;
    const angle = this._settings.viewAngle;

    const boidDirection = this.getBoidDirection(boid.mesh);
    const angleBetween = boidDirection.angleTo(direction);

    if (angleBetween > angle) {
      return false;
    }

    const boidDistance = boid.mesh.position.distanceTo(this.mesh.position);

    if (boidDistance > distance) {
      return false;
    }

    return true;
  }

  separation(boids: Boid[]) {}

  alignment(boids: Boid[]) {}

  cohesion(boids: Boid[]) {}

  move() {
    this.mesh.position.add(this.velocity);
  }

  drawDebugBoid(boids: Boid[]) {
    const line = this._proximityLine;

    if (!line) {
      return;
    }

    line.count = boids.length;

    const dummy = new THREE.Object3D();

    boids.forEach((boid, index) => {
      dummy.position.x = index * 0.5;
      dummy.position.y = index * 0.5;
      dummy.position.z = 0.1;

      line.setMatrixAt(index, dummy.matrix);
    });

    line.instanceMatrix.needsUpdate = true;
    line.computeBoundingSphere();
  }

  update(boids: Boid[]) {
    const boidsInView = boids.filter((boid) => {
      if (boid.id === this.id) {
        return false;
      }

      return this.isBoidInView(boid);
    });

    if (this._isDebug) {
      this.drawDebugBoid(boidsInView);
    }

    this.separation(boidsInView);
    this.alignment(boidsInView);
    this.cohesion(boidsInView);

    this.move();
  }
}
