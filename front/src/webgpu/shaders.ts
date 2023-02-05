export const workGroupSize = 256;

export const computeCode = /*wgsl*/ `
    struct Ball {
      radius: f32,
      position: vec2<f32>,
      velocity: vec2<f32>,
    };

    @group(0) @binding(0)
    var<storage, read> input: array<Ball>;

    @group(0) @binding(1)
    var<storage, read_write> output: array<Ball>;

    @group(0) @binding(4)
    var<storage, read_write> vertex_data: array<vec2<f32>>;

    struct Scene {
      width: f32,
      height: f32,
    };

    @group(0) @binding(2)
    var<storage, read> scene: Scene;

    @group(0) @binding(3)
    var<uniform> mouse: vec2<f32>;

    const PI: f32 = 3.14159;
    const TIME_STEP: f32 = 0.16;
    const G: f32 = 10;

    fn calcForce(src_ball: Ball, other_ball: Ball, min_dist: f32)-> vec2<f32>{
      let other_mass = pow(other_ball.radius, 2.0) * PI;
      let src_mass = 1.0;
      let dist = src_ball.position - other_ball.position;
      return  other_mass*dist  / pow(max(length(dist), min_dist), 3);
    }

    fn constForce(src_ball: Ball, pos: vec2<f32>)-> vec2<f32>{
      let dist = src_ball.position - pos;
      return normalize(dist);
    }

    @compute @workgroup_size(${workGroupSize})
    fn main(
      @builtin(global_invocation_id)
      global_id : vec3<u32>,
    ) {
      let num_balls = arrayLength(&output);
      if(global_id.x >= num_balls) {
        return;
      }
      var src_ball = input[global_id.x];
      let src_mass = 1.0;
      let dst_ball = &output[global_id.x];
      let mouse_ball = Ball(500.0, mouse, vec2(100, 100));
      var gravity = -constForce(src_ball, mouse)*0.05;

      (*dst_ball) = src_ball;

      // Ball/Ball collision
      for(var i = 0u; i < num_balls; i = i + 1u) {
        if(i == global_id.x) {
          continue;
        }
        let other_ball = input[i];
        //gravity calc
        gravity += calcForce(src_ball, other_ball, 0.01)*G;
      }

      // Apply velocity
      let damping = -src_ball.velocity/2;
      gravity+=damping;
      (*dst_ball).velocity += gravity/src_mass*TIME_STEP;
      (*dst_ball).position = (*dst_ball).position + (*dst_ball).velocity * TIME_STEP;

      // Ball/Wall collision
      if((*dst_ball).position.x - (*dst_ball).radius < -scene.width) {
        (*dst_ball).position.x = -scene.width + (*dst_ball).radius;
        (*dst_ball).velocity.x = -(*dst_ball).velocity.x;
      }
      if((*dst_ball).position.y - (*dst_ball).radius < -scene.height) {
        (*dst_ball).position.y = -scene.height + (*dst_ball).radius;
        (*dst_ball).velocity.y = -(*dst_ball).velocity.y;
      }
      if((*dst_ball).position.x + (*dst_ball).radius >= scene.width) {
        (*dst_ball).position.x = scene.width - (*dst_ball).radius;
        (*dst_ball).velocity.x = -(*dst_ball).velocity.x;
      }
      if((*dst_ball).position.y + (*dst_ball).radius >= scene.height) {
        (*dst_ball).position.y = scene.height - (*dst_ball).radius;
        (*dst_ball).velocity.y = -(*dst_ball).velocity.y;
      }

      vertex_data[global_id.x] = (*dst_ball).position;
    }
  `;

export const triangleVertWGSL = /*wgsl*/ `

@binding(0) @group(0) var<storage> centers : array<vec2<f32>>;

@vertex
fn main(
   @builtin(instance_index) instanceIdx : u32,
  @builtin(vertex_index) VertexIndex : u32,
  @location(0) pos: vec2<f32>
  ) -> @builtin(position) vec4<f32> {
    let final_pos = pos + centers[instanceIdx];
    return vec4<f32>(final_pos, 0.0, 1.0);
  }
  `;

export const redFragWGSL = /*wgsl*/ `

@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.0, 0.0, 1.0);
}
`;
