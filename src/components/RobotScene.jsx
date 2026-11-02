import React, { useEffect, useRef, useState } from 'react';

// Full-viewport scene and section-based camera path adapted from the supplied reference.
export default function RobotScene({ activeSolution = 0, onReady }) {
  const container = useRef(null);
  const sceneRef = useRef(null);
  const selectedRef = useRef(activeSolution);
  const [ready, setReady] = useState(false);
  selectedRef.current = activeSolution;

  useEffect(() => { sceneRef.current?.setProp(activeSolution); sceneRef.current?.refresh(); }, [activeSolution]);

  useEffect(() => {
    let disposed = false, renderer, observer, frame, scene, renderOnce, environment;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const node = container.current;
    let onMotion;
    async function setup() {
      try {
        const [THREE, { createReferenceScene }] = await Promise.all([
          import('three'), import('./referenceScene')
        ]);
        if (disposed) return;
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Neutral light panels give the metallic materials more defined reflections.
        const studio = new THREE.Scene();
        studio.add(new THREE.Mesh(new THREE.BoxGeometry(60, 30, 60), new THREE.MeshBasicMaterial({ color: 0x7d8997, side: THREE.BackSide })));
        [[0, 14, 0, Math.PI / 2, 0], [-18, 5, 4, 0, Math.PI / 2], [18, 5, -4, 0, -Math.PI / 2]].forEach(([x, y, z, rx, ry]) => {
          const panel = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
          panel.position.set(x, y, z); panel.rotation.set(rx, ry, 0); studio.add(panel);
        });
        const pmrem = new THREE.PMREMGenerator(renderer);
        environment = pmrem.fromScene(studio, 0.04);
        scene.environment = environment.texture;
        pmrem.dispose();
        studio.traverse(item => { item.geometry?.dispose(); item.material?.dispose(); });
        node.appendChild(renderer.domElement);
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
        scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4c2, 1.5));
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(6, 11, 7); sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 46 });
        sun.shadow.bias = -0.0004;
        scene.add(sun, sun.target);
        const fill = new THREE.DirectionalLight(0xe5efff, 1.4);
        fill.position.set(-8, 6, -4); scene.add(fill);
        const world = createReferenceScene(scene);
        world.setProp(selectedRef.current);
        const V = (x, y, z) => new THREE.Vector3(x, y, z);
        const x = world.stageX;
        const poses = [
          { p: V(4.8, 3.9, 12.8), l: V(0.8, 1.3, 0.8) },
          { p: V(-4.6, 3, 9.8), l: V(0.8, 1.4, 0.8) },
          { p: V(x + 0.6, 4.4, 16.2), l: V(x, 1.5, 0) },
          { p: V(15, 4.5, 12), l: V(15, 1, 0) },
          { p: V(4.2, 3.8, 12.6), l: V(0.8, 1.4, 0.8) }
        ];
        const path = new THREE.CatmullRomCurve3(poses.map(p => p.p), false, 'catmullrom', 0.4);
        const look = new THREE.CatmullRomCurve3(poses.map(p => p.l), false, 'catmullrom', 0.4);
        const ids = ['top', 'capabilities', 'solutions', 'process', 'inquire'];
        let anchors = [], W = 1, H = 1, scrollCurrent = 0, last = performance.now(), lastPaint = 0;
        const pos = new THREE.Vector3(), target = new THREE.Vector3();
        const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
        function measure() {
          anchors = ids.map(id => {
            const el = document.getElementById(id);
            return el ? el.getBoundingClientRect().top + window.scrollY : 0;
          });
        }
        function resize() {
          W = window.innerWidth; H = window.innerHeight;
          renderer.setSize(W, H, false);
          camera.aspect = W / H;
          camera.fov = W < 700 ? 52 : 34;
          camera.setViewOffset(W, H, W >= 960 ? -W * 0.24 : -W * 0.1, W >= 960 ? 0 : H * 0.1, W, H);
          camera.updateProjectionMatrix();
          measure();
          if (media.matches) renderOnce?.(performance.now());
        }
        function scrollPosition() {
          const y = window.scrollY + H * 0.4;
          if (window.scrollY + H >= document.documentElement.scrollHeight - 4) return anchors.length - 1;
          if (y <= anchors[0]) return 0;
          for (let i = 0; i < anchors.length - 1; i++) {
            if (y < anchors[i + 1]) {
              let f = (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]);
              f = clamp((f - 0.5) / 0.5, 0, 1);
              return i + f * f * (3 - 2 * f);
            }
          }
          return anchors.length - 1;
        }
        const started = performance.now();
        function render(now) {
          if (disposed) return;
          if (!media.matches && now - lastPaint < 1000 / 30) { frame = requestAnimationFrame(render); return; }
          lastPaint = now;
          const dt = Math.min(0.1, (now - last) / 1000); last = now;
          const next = scrollPosition();
          scrollCurrent = media.matches ? next : scrollCurrent + (next - scrollCurrent) * (1 - Math.exp(-dt * 3.4));
          const time = media.matches ? 2 : 0.4 + (now - started) / 1000;
          const u = clamp(scrollCurrent / 4, 0, 1);
          path.getPoint(u, pos); look.getPoint(u, target);
          camera.position.copy(pos); camera.lookAt(target);
          sun.position.set(target.x + 6, 11, target.z + 7);
          sun.target.position.copy(target); sun.target.updateMatrixWorld();
          // The reference fades out the 3D scene behind its dark process section.
          const opacity = scrollCurrent < 2.3 ? 1 : scrollCurrent < 3 ? 1 - (scrollCurrent - 2.3) / 0.7 : scrollCurrent < 3.6 ? 0 : Math.min(1, (scrollCurrent - 3.6) / 0.4);
          renderer.domElement.style.opacity = String(opacity);
          if (opacity > 0.001) {
            world.update(time);
            renderer.render(scene, camera);
          }
          if (!media.matches && !document.hidden) frame = requestAnimationFrame(render);
        }
        renderOnce = render;
        sceneRef.current = { setProp: world.setProp, refresh: () => { if (media.matches) render(performance.now()); } };
        observer = new ResizeObserver(measure); observer.observe(document.body);
        window.addEventListener('resize', resize);
        const onScroll = () => { if (media.matches) render(performance.now()); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onMotion = () => { cancelAnimationFrame(frame); render(performance.now()); };
        media.addEventListener('change', onMotion);
        const onVisibility = () => {
          cancelAnimationFrame(frame);
          if (!document.hidden) { last = performance.now(); lastPaint = 0; render(last); }
        };
        document.addEventListener('visibilitychange', onVisibility);
        node._cleanup = () => { window.removeEventListener('resize', resize); window.removeEventListener('scroll', onScroll); media.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onVisibility); };
        resize(); render(performance.now()); setReady(true); onReady?.(true);
      } catch (error) {
        console.warn('3D background unavailable; using the static background.', error);
      }
    }
    setup();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); node?._cleanup?.(); sceneRef.current = null;
      if (scene) scene.traverse(item => {
        item.geometry?.dispose();
        if (item.material) (Array.isArray(item.material) ? item.material : [item.material]).forEach(material => material.dispose());
      });
      environment?.dispose(); renderer?.dispose(); renderer?.domElement.remove();
    };
  }, [onReady]);
  return <div ref={container} className={`hero-robot ${ready ? 'hero-robot-ready' : ''}`} aria-hidden="true" />;
}
