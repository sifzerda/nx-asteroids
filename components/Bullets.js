// components/Bullets.js

'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BULLET_SPEED = 60;
const BULLET_LIFE = 1.2;

export default forwardRef(function Bullets(_, ref) {
  const groupRef = useRef();
  const bullets = useRef([]);

  const glowTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,100,255,1)');
    gradient.addColorStop(0.5, 'rgba(180,0,255,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // -----------------------------
  // EXPOSE API TO SHIP
  // -----------------------------
  useImperativeHandle(ref, () => ({
    shoot(position, direction, shipHeight = 1) {
      const dir = direction.clone().normalize();

      const tipOffset = dir.clone().multiplyScalar(shipHeight / 2);

      const material = new THREE.SpriteMaterial({
        map: glowTexture,
        color: '#ff66ff',
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Sprite(material);
      mesh.scale.set(0.45, 1.8, 1);

      mesh.position.copy(position).add(tipOffset);

      material.rotation =
        Math.atan2(dir.y, dir.x) - Math.PI / 2;

      bullets.current.push({
        mesh,
        vel: dir.multiplyScalar(BULLET_SPEED),
        life: BULLET_LIFE,
      });

      groupRef.current.add(mesh);
    },
  }));

  // -----------------------------
  // UPDATE LOOP
  // -----------------------------
  useFrame((_, delta) => {
    for (let i = bullets.current.length - 1; i >= 0; i--) {
      const b = bullets.current[i];

      b.life -= delta;

      if (b.life <= 0) {
        groupRef.current.remove(b.mesh);
        bullets.current.splice(i, 1);
        continue;
      }

      b.mesh.position.addScaledVector(b.vel, delta);
    }
  });

  return <group ref={groupRef} />;
});