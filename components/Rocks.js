'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 2;
const ASTEROID_SIZE = 0.5;
const SPAWN_INTERVAL = 2;

export default function Rocks({ bulletsRef }) {
  const asteroids = useRef([]);
  const fragments = useRef([]);
  const groupRef = useRef();
  const spawnTimer = useRef(0);

  const rand = (min, max) => Math.random() * (max - min) + min;

  // ---------------- SPAWN ASTEROID ----------------
  function spawnAsteroid() {
    const limit = 10;
    let x = 0, y = 0;

    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { x = rand(-limit, limit); y = limit; }
    if (edge === 1) { x = rand(-limit, limit); y = -limit; }
    if (edge === 2) { x = -limit; y = rand(-limit, limit); }
    if (edge === 3) { x = limit; y = rand(-limit, limit); }

    const dir = new THREE.Vector3(rand(-1,1), rand(-1,1), 0).normalize();
    const speed = rand(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);

    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(ASTEROID_SIZE, 0),
      new THREE.MeshBasicMaterial({
        color: 'orange',
        wireframe: true
      })
    );

    mesh.position.set(x, y, 0);

    asteroids.current.push({
      mesh,
      vel: dir.multiplyScalar(speed),
      radius: ASTEROID_SIZE,
    });

    groupRef.current.add(mesh);
  }

  // ---------------- SHATTER ----------------
  function shatter(position, incomingVel) {
    const count = 6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial({ color: '#ffaa66' })
      );

      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        0
      );

      // inherit impact force
      vel.add(incomingVel.clone().multiplyScalar(0.2));

      fragments.current.push({
        mesh,
        vel,
        life: 1.0 + Math.random() * 0.5,
      });

      groupRef.current.add(mesh);
    }
  }

  // ---------------- UPDATE ----------------
  useFrame((_, delta) => {
    spawnTimer.current += delta;

    // spawn asteroids
    if (spawnTimer.current > SPAWN_INTERVAL) {
      spawnTimer.current = 0;
      spawnAsteroid();
    }

    // move asteroids
    asteroids.current.forEach(a => {
      a.mesh.position.addScaledVector(a.vel, delta);
    });

    const bullets = bulletsRef?.current;

    // ---------------- COLLISION ----------------
    if (Array.isArray(bullets)) {
      asteroids.current = asteroids.current.filter(a => {
        let hit = false;

        bullets.forEach(b => {
          if (!b.mesh) return;

          const dist = a.mesh.position.distanceTo(b.mesh.position);

          if (dist < ASTEROID_SIZE + 0.1) {
            hit = true;
            b.life = -1;

            // 💥 SHATTER INSTEAD OF DELETE
            shatter(a.mesh.position, a.vel);
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