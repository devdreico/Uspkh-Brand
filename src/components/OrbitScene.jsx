import React, { useEffect, useRef } from 'react';

export default function OrbitScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled || !canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 7);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);

      const group = new THREE.Group();
      scene.add(group);
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.35, 3),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d4, roughness: 0.22, metalness: 0.35, emissive: 0x123e55, emissiveIntensity: 0.35 }),
      );
      group.add(core);

      const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 8, 120), new THREE.MeshBasicMaterial({ color: 0x218bb8, transparent: true, opacity: 0.8 }));
      ringA.rotation.set(0.6, -0.4, 0.2);
      const ringB = ringA.clone();
      ringB.scale.set(0.72, 1.2, 1);
      ringB.rotation.set(-0.7, 0.3, -0.35);
      group.add(ringA, ringB);

      const points = new THREE.Group();
      for (let index = 0; index < 7; index += 1) {
        const angle = (index / 7) * Math.PI * 2;
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: index % 2 ? 0x218bb8 : 0xe7e7e7 }));
        node.position.set(Math.cos(angle) * (1.9 + (index % 2) * 0.35), Math.sin(angle) * 1.2, Math.sin(angle * 1.5) * 0.5);
        points.add(node);
      }
      group.add(points);

      scene.add(new THREE.AmbientLight(0xbababa, 1.7));
      const key = new THREE.PointLight(0x218bb8, 13, 20);
      key.position.set(3, 2, 5);
      scene.add(key);

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        if (!reduced) {
          group.rotation.y += 0.0028;
          group.rotation.x = Math.sin(Date.now() * 0.00035) * 0.08;
        }
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        renderer.dispose();
        core.geometry.dispose();
        core.material.dispose();
        ringA.geometry.dispose();
        ringA.material.dispose();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className="orbit-scene">
      <canvas ref={canvasRef} aria-label="Visualización del flujo de presupuesto de campañas de pauta" role="img" />
      <div className="orbit-fallback" aria-hidden="true">
        <span>↗</span>
      </div>
      <span className="scene-tag scene-tag-one">
        + atención<small>señales que se mueven</small>
      </span>
      <span className="scene-tag scene-tag-two">
        pauta / resultados<small>registro operativo</small>
      </span>
      <span className="scene-cross">✦</span>
    </div>
  );
}
