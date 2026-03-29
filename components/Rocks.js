'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;
const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 2;
const ASTEROID_SIZE = 0.5;
const SPAWN_INTERVAL = 2; // seconds

export default function Rocks({ bulletsRef }) {
  const asteroids = useRef([]);
  const groupRef = useRef();
  const spawnTimer = useRef(0);

  // Utility: random number between min and max
  const rand = (min, max) => Math.random() * (max - min) + min;

  useFrame((_, delta) => {
    // spawn new asteroid
    spawnTimer.current += delta;
    if (spawnTimer.current > SPAWN_INTERVAL) {
      spawnTimer.current = 0;

      // spawn at random edge
      let x = 0, y = 0;
      const edge = Math.floor(Math.random() * 4); // 0: top,1:bottom,2:left,3:right
      const limit = 10;
      if (edge === 0) { x = rand(-limit, limit); y = limit; }
      if (edge === 1) { x = rand(-limit, limit); y = -limit; }
      if (edge === 2) { x = -limit; y = rand(-limit, limit); }
      if (edge === 3) { x = limit; y = rand(-limit, limit); }

      // random direction toward screen center
      const dir = new THREE.Vector3(rand(-1,1), rand(-1,1), 0).normalize();
      const speed = rand(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);

      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(ASTEROID_SIZE, 0),
        new THREE.MeshBasicMaterial({ color: 'orange', wireframe: true })
      );
      mesh.position.set(x, y, 0);

      asteroids.current.push({ mesh, vel: dir.multiplyScalar(speed) });
      groupRef.current.add(mesh);
    }

    // move asteroids
    asteroids.current.forEach(a => {
      a.mesh.position.addScaledVector(a.vel, delta);
    });

    // check bullet collisions
    if (bulletsRef?.current) {
      const bullets = bulletsRef.current;
      asteroids.current = asteroids.current.filter(a => {
        let hit = false;
        bullets.forEach(b => {
          if (b.mesh.position.distanceTo(a.mesh.position) < ASTEROID_SIZE + 0.1) {
            // collision detected
            groupRef.current.remove(a.mesh);
            a.mesh.geometry.dispose();
            a.mesh.material.dispose();
            hit = true;

            // also remove bullet
            b.life = -1;
          }
        });
        return !hit;
      });
    }
  });

  return <group ref={groupRef} />;
}