"use client";

import { useEffect, useRef } from "react";

const FRAG = `precision mediump float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv * 3.0 + u_time * 0.05;
  float m = distance(uv, u_mouse);
  float f = fbm(p + fbm(p + u_time * 0.08) * 0.9);
  float glow = smoothstep(0.55, 0.0, m) * 0.35;
  vec3 col = mix(vec3(0.05, 0.05, 0.06), vec3(0.92, 0.92, 0.9), smoothstep(0.25, 0.85, f));
  col += glow * vec3(0.9, 0.9, 0.85);
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

/**
 * Exploration: shader drift.
 * A fullscreen fbm field on raw WebGL — no images, no libraries.
 * The pointer pours light into the grain. Still frame under
 * reduced motion.
 */
export function ExplorationShader() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const mouse = { x: 0.5, y: 0.5 };
    const t0 = performance.now();

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(2, Math.floor(r.width * dpr));
      canvas.height = Math.max(2, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    window.addEventListener("resize", size);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("pointermove", onMove);

    let raf = 0;
    const draw = () => {
      const t = reduced ? 8 : (performance.now() - t0) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-label="Animated shader field" className="block h-80 w-full rounded-xl" />;
}
