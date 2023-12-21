import * as THREE from 'three';

export class Boid {
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private acceleration: THREE.Vector3;
  private direction: THREE.Vector3;

  constructor(mesh: THREE.Mesh) {
    this.mesh = mesh;
    this.velocity = new THREE.Vector3();
  }
}
