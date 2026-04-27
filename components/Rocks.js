// components/Rocks.js
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 2;
const SPAWN_INTERVAL = 2;

// size system (REAL fix)
const ASTEROID_SIZES = {
  LARGE: 0.8,
  MEDIUM: 0.5,
  SMALL: 0.25,
};

export default function Rocks({ bulletsRef }) {
  const asteroids = useRef([]);
  const fragments = useRef([]);
  const groupRef = useRef();
  const spawnTimer = useRef(0);

  const rand = (min, max) => Math.random() * (max - min) + min;

  // ---------------- SPAWN ----------------
  function spawnAsteroid(size = 'LARGE', position = null) {
    const radius = ASTEROID_SIZES[size];

    const limit = 10;
    let x = 0, y = 0;

    if (!position) {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = rand(-limit, limit); y = limit; }
      if (edge === 1) { x = rand(-limit, limit); y = -limit; }
      if (edge === 2) { x = -limit; y = rand(-limit, limit); }
      if (edge === 3) { x = limit; y = rand(-limit, limit); }
    }

    const dir = new THREE.Vector3(rand(-1, 1), rand(-1, 1), 0).normalize();
    const speed = rand(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);

    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 0),
      new THREE.MeshBasicMaterial({
        color: 'orange',
        wireframe: true,
      })
    );

    if (position) {
      mesh.position.copy(position);
    } else {
      mesh.position.set(x, y, 0);
    }

    const asteroid = {
      mesh,
      vel: dir.multiplyScalar(speed),
      radius,
      size,
    };

    asteroids.current.push(asteroid);
    groupRef.current.add(mesh);
  }

  // ---------------- VISUAL SHATTER ----------------
  function shatter(position, incomingVel) {
    const count = 6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.1, 0),
        new THREE.MeshBasicMaterial({ color: '#ffaa66' })
      );

      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        0
      );

      vel.add(incomingVel.clone().multiplyScalar(0.2));

      fragments.current.push({
        mesh,
        vel,
        life: 1 + Math.random() * 0.5,
      });

      groupRef.current.add(mesh);
    }
  }

  // ---------------- SPLIT LOGIC ----------------
  function splitAsteroid(asteroid) {
    const nextSize =
      asteroid.size === 'LARGE'
        ? 'MEDIUM'
        : asteroid.size === 'MEDIUM'
        ? 'SMALL'
        : null;

    // remove original
    groupRef.current.remove(asteroid.mesh);
    asteroid.mesh.geometry.dispose();
    asteroid.mesh.material.dispose();

    if (!nextSize) {
      // smallest → just explode
      shatter(asteroid.mesh.position, asteroid.vel);
      return;
    }

    // spawn 2 smaller asteroids
    for (let i = 0; i < 2; i++) {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        0
      ).normalize();

      spawnAsteroid(nextSize, asteroid.mesh.position.clone());

      const newAst =
        asteroids.current[asteroids.current.length - 1];

      newAst.vel = dir.multiplyScalar(rand(1, 2));
    }

    // add visual debris too
    shatter(asteroid.mesh.position, asteroid.vel);
  }

  // ---------------- UPDATE ----------------
  useFrame((_, delta) => {
    spawnTimer.current += delta;

    // spawn
    if (spawnTimer.current > SPAWN_INTERVAL) {
      spawnTimer.current = 0;
      spawnAsteroid();
    }

    // move asteroids
    asteroids.current.forEach(a => {
      a.mesh.position.addScaledVector(a.vel, delta);
    });

    const bullets = bulletsRef?.current;

    // ---------------- COLLISIONS ----------------
    if (Array.isArray(bullets)) {
      const remaining = [];

      for (let i = 0; i < asteroids.current.length; i++) {
        const a = asteroids.current[i];
        let hit = false;

        for (let j = 0; j < bullets.length; j++) {
          const b = bullets[j];
          if (!b.mesh) continue;

          const dist = a.mesh.position.distanceTo(b.mesh.position);

          if (dist < a.radius + 0.1) {
            hit = true;
            b.life = -1;

            splitAsteroid(a);
            break; // IMPORTANT: stop multiple hits same frame
          }
        }

        if (!hit) {
          remaining.push(a);
        }
      }

      asteroids.current = remaining;
    }

    // ---------------- FRAGMENTS ----------------
    for (let i = fragments.current.length - 1; i >= 0; i--) {
      const f = fragments.current[i];

      f.mesh.position.addScaledVector(f.vel, delta);
      f.vel.multiplyScalar(0.98);
      f.life -= delta;

      f.mesh.material.opacity = f.life;
      f.mesh.material.transparent = true;

      if (f.life <= 0) {
        groupRef.current.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
        fragments.current.splice(i, 1);
      }
    }
  });

  return <group ref={groupRef} />;
}