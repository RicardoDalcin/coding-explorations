import { Vec2, Vec3, dot2 } from './engine/linear';

export class Noise {
  seed: number;
  octaves: number;
  amplitude: number;
  smoothness: number;
  roughness: number;
  offset: number;
  perm = new Array(512);
  grad3 = [
    new Vec3(1, 1, 0),
    new Vec3(-1, 1, 0),
    new Vec3(1, -1, 0),
    new Vec3(-1, -1, 0),
    new Vec3(1, 0, 1),
    new Vec3(-1, 0, 1),
    new Vec3(1, 0, -1),
    new Vec3(-1, 0, -1),
    new Vec3(0, 1, 1),
    new Vec3(0, -1, 1),
    new Vec3(0, 1, -1),
    new Vec3(0, -1, -1),
  ];

  constructor(
    seed: number,
    octaves: number,
    amplitude: number,
    smoothness: number,
    roughness: number,
    offset: number
  ) {
    this.seed = seed;
    this.octaves = octaves;
    this.amplitude = amplitude;
    this.smoothness = smoothness;
    this.roughness = roughness;
    this.offset = offset;

    this.init();
  }

  init() {
    for (let i = 0; i < 256; i++) {
      this.perm[i] = i;
    }

    for (let i = 0; i < 256; i++) {
      const randomIndex = Math.floor(Math.random() * 256);
      const temp = this.perm[i];
      this.perm[i] = this.perm[randomIndex];
      this.perm[randomIndex] = temp;
      this.perm[i + 256] = this.perm[i];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  private simplex(x: number, y: number) {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);

    const X = floorX & 255;
    const Y = floorY & 255;

    x -= floorX;
    y -= floorY;

    const gi00 = this.perm[X + this.perm[Y]] % 12;
    const gi01 = this.perm[X + this.perm[Y + 1]] % 12;
    const gi10 = this.perm[X + 1 + this.perm[Y]] % 12;
    const gi11 = this.perm[X + 1 + this.perm[Y + 1]] % 12;

    let n00 = dot2(this.grad3[gi00].reduce(), new Vec2(x, y));
    let n10 = dot2(this.grad3[gi10].reduce(), new Vec2(x - 1, y));
    let n01 = dot2(this.grad3[gi01].reduce(), new Vec2(x, y - 1));
    let n11 = dot2(this.grad3[gi11].reduce(), new Vec2(x - 1, y - 1));

    const u = this.fade(x);
    const v = this.fade(y);

    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), v);
  }

  getNoise(position: Vec2) {
    let value = 0;
    let accumulatedAmplitude = 0;

    for (let i = 0; i < this.octaves; i++) {
      const frequency = Math.pow(2, i);
      const amplitude = Math.pow(this.roughness, i);

      const x = (position.x * frequency) / this.smoothness;
      const y = (position.y * frequency) / this.smoothness;

      const noise = this.simplex(this.seed + x, this.seed + y);

      const compoundNoise = (noise + 1) / 2;
      value = value + compoundNoise * amplitude;

      accumulatedAmplitude += amplitude;
    }

    return value / accumulatedAmplitude;
  }

  getLerpNoise(position: Vec2, nextNoise: Noise, progress: number) {
    let value = 0;
    let accumulatedAmplitude = 0;

    for (let i = 0; i < this.octaves; i++) {
      const frequency = Math.pow(2, i);
      const amplitude = Math.pow(this.roughness, i);

      const x = (position.x * frequency) / this.smoothness;
      const y = (position.y * frequency) / this.smoothness;

      const noise = this.simplex(this.seed + x, this.seed + y);
      const nextNoiseValue = nextNoise.simplex(
        nextNoise.seed + x,
        nextNoise.seed + y
      );

      const compoundNoise = this.lerp(noise, nextNoiseValue, progress);
      value = value + compoundNoise * amplitude;

      accumulatedAmplitude += amplitude;
    }

    return value / accumulatedAmplitude;
  }
}
