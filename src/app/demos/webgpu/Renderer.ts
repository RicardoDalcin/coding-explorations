import shader from "./shader.wgsl";
import { TriangleMesh } from "./TriangleMesh";

export class Renderer {
  canvas: HTMLCanvasElement;

  adapter!: GPUAdapter;
  device!: GPUDevice;
  context!: GPUCanvasContext;
  format!: GPUTextureFormat;

  bindGroup!: GPUBindGroup;
  pipeline!: GPURenderPipeline;

  triangleMesh!: TriangleMesh;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize() {
    await this.setupDevice();
    this.createAssets();
    await this.makePipeline();

    this.render();
  }

  async setupDevice() {
    if (!navigator.gpu) {
      throw "Your current browser does not support WebGPU!";
    }

    this.adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter;
    this.device = (await this.adapter?.requestDevice()) as GPUDevice;
    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });
  }

  createAssets() {
    this.triangleMesh = new TriangleMesh(this.device);
  }

  async makePipeline() {
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: this.device.createShaderModule({
          code: shader,
        }),
        entryPoint: "vs_main",
        buffers: [this.triangleMesh.bufferLayout],
      },
      fragment: {
        module: this.device.createShaderModule({
          code: shader,
        }),
        entryPoint: "fs_main",
        targets: [
          {
            format: this.format,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
  }

  render() {
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: [0.1, 0.1, 0.1, 1],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.setVertexBuffer(0, this.triangleMesh.buffer);
    passEncoder.draw(3);
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}

