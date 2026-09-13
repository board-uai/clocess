export const ENV = `
uniform vec2  uRes;
uniform vec3  uEnvTop;
uniform vec3  uEnvBot;
uniform vec2  uHot;
uniform vec4  uLogo;   // xy = centre px, z = width px, w = strength
uniform float uRoom;   // 1 = lit room, 0 = pure black
uniform vec4  uGlow;   // xy = source centre px, z = radius px, w = strength

vec3 envAt(vec2 fc){
  vec2 uv = fc / uRes;
  float g = 1.0 - uv.y;
  vec3 c = mix(uEnvTop, uEnvBot, g * g * 0.80);

  // one soft overhead source, drifting with the pointer
  float d = distance(vec2(uv.x * (uRes.x / uRes.y), uv.y), uHot);
  c += vec3(0.030) * (1.0 - smoothstep(0.0, 1.05, d));

  // the light sunk into the back of the room, seen through the air
  float gd = distance(fc, uGlow.xy) / max(uGlow.z, 1.0);
  c += vec3(uGlow.w) * exp(-gd * gd * 1.8);

  // contact shadow, driven by the logo's measured rect
  vec2 rel = (fc - uLogo.xy) / max(uLogo.z, 1.0);
  rel.y = (rel.y + 0.30) * 3.4;
  float sh = 1.0 - smoothstep(0.0, 0.52, length(rel));
  c *= 1.0 - sh * 0.085 * uLogo.w;

  return c;
}
`

/* screen-space quad: no camera transform, so the room never moves */
export const SKY_VERT = `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`

// dim here and not inside envAt, so the additive hotspot dies too and 0 is truly 0
export const SKY_FRAG = `${ENV}
void main(){ gl_FragColor = vec4(envAt(gl_FragCoord.xy) * uRoom, 1.0); }`
