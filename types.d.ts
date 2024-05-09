// all GLSL files are loaded as strings and can be imported as modules
declare module "*.fs" {
  const value: string;
  export default value;
}

declare module "*.vs" {
  const value: string;
  export default value;
}

declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare module "*.wgsl";
