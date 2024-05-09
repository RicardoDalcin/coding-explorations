struct Fragment {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> Fragment {
  var positions = array<vec2f, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  var colors = array<vec3f, 3>(
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0)
  );

  var output : Fragment;
  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
  output.color = vec4<f32>(colors[vertexIndex], 1.0);

  return output;
}

@fragment
fn fs_main(@location(0) color : vec4<f32>) -> @location(0) vec4<f32> {
  return color;
}