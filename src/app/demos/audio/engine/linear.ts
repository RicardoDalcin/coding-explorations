export class Vec2 {
  value: [number, number];

  constructor(x: number, y: number) {
    this.value = [x, y];
  }

  get x() {
    return this.value[0];
  }

  get y() {
    return this.value[1];
  }
}

export class Vec3 {
  value: [number, number, number];

  constructor(x: number, y: number, z: number) {
    this.value = [x, y, z];
  }

  get x() {
    return this.value[0];
  }

  get y() {
    return this.value[1];
  }

  get z() {
    return this.value[2];
  }

  reduce() {
    return new Vec2(this.x, this.y);
  }
}

export function dot2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}
