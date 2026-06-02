import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Recolored shader background for Kortex.
 * Originally: aurora (blue/purple). Now: acid-lime signal aurora on near-black.
 * Honors prefers-reduced-motion by rendering a single static frame.
 */
const KortexAurora = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // PERF: render at 60% logical resolution, DPR pinned to 1, and let CSS
    // scale the canvas to fill the viewport. The aurora's natural blur hides
    // the upscaling, and pixel work drops by ~75% vs retina full-res.
    const RENDER_SCALE = 0.6;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    const sizeW = Math.round(window.innerWidth * RENDER_SCALE);
    const sizeH = Math.round(window.innerHeight * RENDER_SCALE);
    // `updateStyle: false` lets us drive CSS independently of the internal canvas size.
    renderer.setSize(sizeW, sizeH, false);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(sizeW, sizeH),
        },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      // Mutated palette: biased toward acid lime, dim ink-green, soft amber tail
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u * u * (3.0 - 2.0 * u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5)
                   / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          // PERF: 35 -> 22 iterations. Visual difference is minimal because
          // the late iterations contribute mostly to the dim tail.
          for (float i = 0.0; i < 22.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
                  + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);

            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 22.0));

            // Acid-lime biased palette: R 0.7-1.0, G 0.95-1.0, B low (0.05-0.25)
            vec4 limeCore = vec4(
              0.75 + 0.20 * sin(i * 0.20 + iTime * 0.40),
              0.95 + 0.05 * cos(i * 0.30 + iTime * 0.50),
              0.10 + 0.15 * sin(i * 0.40 + iTime * 0.30),
              1.0
            );

            vec4 currentContribution = limeCore
              * exp(sin(i * i + iTime * 0.8))
              / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));

            float thinnessFactor = smoothstep(0.0, 1.0, i / 22.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 0.85;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.014;
      renderer.render(scene, camera);
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(animate);
      }
    };
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    let resizeTimer: number | undefined;
    const handleResize = () => {
      // Debounce so a window drag doesn't trigger dozens of resizes per second.
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const w = Math.round(window.innerWidth * RENDER_SCALE);
        const h = Math.round(window.innerHeight * RENDER_SCALE);
        renderer.setSize(w, h, false);
        material.uniforms.iResolution.value.set(w, h);
      }, 120);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      aria-hidden="true"
    />
  );
};

export default KortexAurora;
