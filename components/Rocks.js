'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;
const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 2;
const ASTEROID_SIZE = 0.5;   // radius
const SPAWN_INTERVAL = 2;    // seconds

export default function Rocks({ bulletsRef }) {
  const asteroids = useRef([]);
  const groupRef = useRef();
  const spawnTimer = useRef(0);

  const rand = (min, max) => Math.random() * (max - min) + min;

  useFrame((_, delta) => {
    spawnTimer.current += delta;

    // --- spawn asteroid ---
    if (spawnTimer.current > SPAWN_INTERVAL) {
      spawnTimer.current = 0;

      const limit = 10;
      let x = 0, y = 0;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = rand(-limit, limit); y = limit; }      // top
      if (edge === 1) { x = rand(-limit, limit); y = -limit; }     // bottom
      if (edge === 2) { x = -limit; y = rand(-limit, limit); }     // left
      if (edge === 3) { x = limit; y = rand(-limit, limit); }      // right

      const dir = new THREE.Vector3(rand(-1, 1), rand(-1, 1), 0).normalize();
      const speed = rand(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);

      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(ASTEROID_SIZE, 0),
        new THREE.MeshBasicMaterial({ color: 'orange', wireframe: true })
      );
      mesh.position.set(x, y, 0);

      asteroids.current.push({ mesh, vel: dir.multiplyScalar(speed) });
      groupRef.current.add(mesh);
    }

    // --- move asteroids ---
    asteroids.current.forEach(a => {
      a.mesh.position.addScaledVector(a.vel, delta);
    });

    // --- check collision with bullets ---
    const bullets = bulletsRef?.current;
    if (Array.isArray(bullets)) {
      asteroids.current = asteroids.current.filter(a => {
        let hit = false;

        bullets.forEach(b => {
          if (!b.mesh) return;
          const dist = a.mesh.position.distanceTo(b.mesh.position);
          if (dist < ASTEROID_SIZE + 0.1) {
            hit = true;
            b.life = -1; // mark bullet for removal
          }
        });

        if (hit) {
          groupRef.current.remove(a.mesh);
          a.mesh.geometry.dispose();
          a.mesh.material.dispose();
          return false;
        }
        return true;
      });
    }
  });

  return <group ref={groupRef} />;
}