import shader from "./shader.wgsl";
import { TriangleMesh } from "./TriangleMesh";

export async function test(container: HTMLElement, canvas: HTMLCanvasElement) {
  container.addEventListener("dblclick", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  });

  if (!navigator.gpu) {
    throw "Your current browser does not support WebGPU!";
  }

  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter;
  const device = (await adapter?.requestDevice()) as GPUDevice;
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device: device,
    format: format,
    alphaMode: "premultiplied",
  });

  const triangleMesh = new TriangleMesh(device);

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
      buffers: [triangleMesh.bufferLayout],
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "fs_main",
      targets: [
        {
          format: format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  function frame() {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

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
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setVertexBuffer(0, triangleMesh.buffer);
    passEncoder.draw(3);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  frame();

  return () => {
    window.removeEventListener("resize", () => {});
    container.removeEventListener("dblclick", () => {});
  };
}
