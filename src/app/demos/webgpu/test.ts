import { Renderer } from "./Renderer";
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

  const renderer = new Renderer(canvas);
  await renderer.initialize();

  return () => {
    window.removeEventListener("resize", () => {});
    container.removeEventListener("dblclick", () => {});
  };
}
