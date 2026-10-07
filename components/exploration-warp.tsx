"use client";

import { useEffect, useRef, useState } from "react";
import { LabViewer } from "./lab-viewer";
import type { LabShots } from "./lab-set";

const pad = (i: number) => String(i + 1).padStart(2, "0");

const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
uniform vec2 u_cell;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_hover;
varying vec2 v_uv;
void main(){
  vec2 world = (a_pos * 0.5 + 0.5) * u_cell;
  float d = distance(world, u_mouse);
  float pull = exp(-d * d * 18.0) * u_hover;
  vec2 dir = (u_mouse - world) * pull * 0.35;
  float wave = sin(u_time * 2.0 + world.x * 9.0 + world.y * 7.0) * 0.012 * (0.3 + pull);
  vec2 p = a_pos + dir + vec2(wave, wave * 0.6);
  v_uv = a_uv;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
void main(){
  vec3 c = texture2D(u_tex, v_uv).rgb;
  gl_FragColor = vec4(c, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function loadTexture(gl: WebGLRenderingContext, src: string): Promise<WebGLTexture | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve(t);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Exploration: WebGL warp wall.
 * The study set as textured quads on raw WebGL — vertices lean toward
 * the pointer and breathe on a slow wave. Matt Jinn's actual medium.
 * Tap a tile for fullscreen.
 */
export function ExplorationWarp({ shots }: { shots: LabShots[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState<number | null>(null);
  const hover = useRef(-1);
  const mouse = useRef({ x: -10, y: -10 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dead = false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const COLS = 4;
    const ROWS = Math.ceil(shots.length / COLS);
    const quads: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < shots.length; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      quads.push({ x: c / COLS, y: 1 - (r + 1) / ROWS, w: 1 / COLS, h: 1 / ROWS });
    }

    const SEG = 12;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    let base = 0;
    for (let s = 0; s <= SEG; s++) {
      for (let t = 0; t <= SEG; t++) {
        pos.push(s / SEG * 2 - 1, t / SEG * 2 - 1);
        uv.push(s / SEG, t / SEG);
      }
    }
    for (let s = 0; s < SEG; s++) {
      for (let t = 0; t < SEG; t++) {
        const a = base + s * (SEG + 1) + t;
        const b = a + 1;
        const c = a + SEG + 1;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aUv = gl.getAttribLocation(prog, "a_uv");
    const uCell = gl.getUniformLocation(prog, "u_cell");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uHover = gl.getUniformLocation(prog, "u_hover");
    const uTex = gl.getUniformLocation(prog, "u_tex");

    const textures: (WebGLTexture | null)[] = new Array(shots.length).fill(null);
    shots.forEach((s, i) => {
      loadTexture(gl, s.src).then((t) => {
        textures[i] = t;
      });
    });

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(2, Math.floor(r.width * dpr));
      canvas.height = Math.max(2, Math.floor(r.height * dpr));
    };
    size();
    window.addEventListener("resize", size);

    const t0 = performance.now();
    let raf = 0;
    const draw = () => {
      if (dead) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.05, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = reduced ? 0 : (performance.now() - t0) / 1000;
      quads.forEach((q, i) => {
        const tex = textures[i];
        if (!tex) return;
        const r = canvas.getBoundingClientRect();
        const px = q.x * r.width;
        const py = (1 - q.y - q.h) * r.height;
        const pw = q.w * r.width - 6;
        const ph = q.h * r.height - 6;
        gl.viewport(px + 3, canvas.height - py - ph - 3, pw, ph);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(uTex, 0);
        gl.uniform2f(uCell, q.x + q.w / 2, 1 - q.y - q.h / 2);
        gl.uniform2f(uMouse, mouse.current.x, mouse.current.y);
        gl.uniform1f(uTime, t);
        gl.uniform1f(uHover, hover.current === i ? 1 : 0.35);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      });
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1 - (e.clientY - r.top) / r.height;
      mouse.current = { x: nx, y: ny };
      const c = Math.min(Math.floor(nx * COLS), COLS - 1);
      const row = Math.min(Math.floor((1 - ny) * ROWS), ROWS - 1);
      const i = row * COLS + c;
      hover.current = i < shots.length ? i : -1;
    };
    canvas.addEventListener("pointermove", move);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      canvas.removeEventListener("pointermove", move);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [shots]);

  return (
    <div className="relative h-80">
      <canvas
        ref={canvasRef}
        aria-label="WebGL image warp wall"
        onClick={(e) => {
          const r = (e.target as HTMLElement).getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width;
          const ny = 1 - (e.clientY - r.top) / r.height;
          const c = Math.min(Math.floor(nx * 4), 3);
          const rows = Math.ceil(shots.length / 4);
          const row = Math.min(Math.floor((1 - ny) * rows), rows - 1);
          const i = row * 4 + c;
          if (i < shots.length) setAt(i);
        }}
        className="block h-full w-full cursor-pointer rounded-xl"
      />
      {at !== null && <LabViewer shots={shots} at={at} onAt={setAt} onClose={() => setAt(null)} dark={true} />}
    </div>
  );
}
