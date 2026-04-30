// components/Rocks.js
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 2;
const SPAWN_INTERVAL = 2;

// ---------------- SIZE SYSTEM ----------------
const ASTEROID_SIZES = {
  LARGE: 1.0,
  MEDIUM: 0.75,
  SMALL: 0.5,
};

// ---------------- HEALTH SYSTEM ----------------
const ASTEROID_HEALTH = {
  LARGE: 500,
  MEDIUM: 250,
  SMALL: 100,
};

const BULLET_DAMAGE = 100;

export default function Rocks({ bulletsRef }) {
  const asteroids = useRef([]);
  const fragments = useRef([]);

  const groupRef = useRef();

  const spawnTimer = useRef(0);

  const rand = (min, max) =>
    Math.random() * (max - min) + min;

  // ==================================================
  // SPAWN ASTEROID
  // ==================================================
  function spawnAsteroid(
    size = 'LARGE',
    position = null
  ) {
    const radius = ASTEROID_SIZES[size];

    const limit = 10;

    let x = 0;
    let y = 0;

    if (!position) {
      const edge = Math.floor(Math.random() * 4);

      if (edge === 0) {
        x = rand(-limit, limit);
        y = limit;
      }

      if (edge === 1) {
        x = rand(-limit, limit);
        y = -limit;
      }

      if (edge === 2) {
        x = -limit;
        y = rand(-limit, limit);
      }

      if (edge === 3) {
        x = limit;
        y = rand(-limit, limit);
      }
    }

    const dir = new THREE.Vector3(
      rand(-1, 1),
      rand(-1, 1),
      0
    ).normalize();

    const speed = rand(
      ASTEROID_MIN_SPEED,
      ASTEROID_MAX_SPEED
    );

    // ---------------- ROCK ----------------
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 0),
      new THREE.MeshBasicMaterial({
        color: 'orange',
        wireframe: true,
      })
    );

    // ---------------- HEALTH BAR ----------------
    const healthBarGroup = new THREE.Group();

    const bgBar = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, 0.12),
      new THREE.MeshBasicMaterial({
        color: '#330000',
      })
    );

    const healthBar = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, 0.12),
      new THREE.MeshBasicMaterial({
        color: '#00ff00',
      })
    );

    healthBar.position.z = 0.01;

    healthBarGroup.add(bgBar);
    healthBarGroup.add(healthBar);

    healthBarGroup.position.y = radius + 0.5;

    mesh.add(healthBarGroup);

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

      health: ASTEROID_HEALTH[size],
      maxHealth: ASTEROID_HEALTH[size],

      healthBar,
    };

    asteroids.current.push(asteroid);

    groupRef.current.add(mesh);
  }

  // ==================================================
  // HEALTH BAR UPDATE
  // ==================================================
  function updateHealthBar(asteroid) {
    const ratio =
      asteroid.health / asteroid.maxHealth;

    asteroid.healthBar.scale.x = Math.max(
      ratio,
      0.001
    );

    asteroid.healthBar.position.x =
      -(asteroid.radius * (1 - ratio));

    // color shift
    if (ratio > 0.6) {
      asteroid.healthBar.material.color.set(
        '#00ff00'
      );
    } else if (ratio > 0.3) {
      asteroid.healthBar.material.color.set(
        '#ffff00'
      );
    } else {
      asteroid.healthBar.material.color.set(
        '#ff0000'
      );
    }
  }

  // ==================================================
  // SHATTER EFFECT
  // ==================================================
  function shatter(position, incomingVel) {
    const count =
      6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.1, 0),
        new THREE.MeshBasicMaterial({
          color: '#ffaa66',
        })
      );

      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        0
      );

      vel.add(
        incomingVel.clone().multiplyScalar(0.2)
      );

      fragments.current.push({
        mesh,
        vel,
        life: 1 + Math.random() * 0.5,
      });

      groupRef.current.add(mesh);
    }
  }

  // ==================================================
  // DESTROY / SPLIT ASTEROID
  // ==================================================
  function destroyAsteroid(asteroid) {
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

    // smallest asteroid
    if (!nextSize) {
      shatter(
        asteroid.mesh.position,
        asteroid.vel
      );

      return;
    }

    // spawn 2 smaller asteroids
    for (let i = 0; i < 2; i++) {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        0
      ).normalize();

      spawnAsteroid(
        nextSize,
        asteroid.mesh.position.clone()
      );

      const newAst =
        asteroids.current[
          asteroids.current.length - 1
        ];

      newAst.vel = dir.multiplyScalar(
        rand(1, 2)
      );
    }

    shatter(
      asteroid.mesh.position,
      asteroid.vel
    );
  }

  // ==================================================
  // UPDATE
  // ==================================================
  useFrame((_, delta) => {
    spawnTimer.current += delta;

    // ---------------- SPAWN ----------------
    if (spawnTimer.current > SPAWN_INTERVAL) {
      spawnTimer.current = 0;

      spawnAsteroid();
    }

    // ---------------- MOVE ----------------
    asteroids.current.forEach((a) => {
      a.mesh.position.addScaledVector(
        a.vel,
        delta
      );

      // rotate for life
      a.mesh.rotation.x += delta * 0.4;
      a.mesh.rotation.y += delta * 0.3;
    });

    const bullets = bulletsRef?.current;

    // ==================================================
    // COLLISIONS
    // ==================================================
    if (Array.isArray(bullets)) {
      const remaining = [];

      for (
        let i = 0;
        i < asteroids.current.length;
        i++
      ) {
        const a = asteroids.current[i];

        let destroyed = false;

        for (
          let j = 0;
          j < bullets.length;
          j++
        ) {
          const b = bullets[j];

          if (!b.mesh) continue;

          const dist =
            a.mesh.position.distanceTo(
              b.mesh.position
            );

          if (dist < a.radius + 0.1) {
            // remove bullet
            b.life = -1;

            // damage asteroid
            a.health -= BULLET_DAMAGE;

            updateHealthBar(a);

            // tiny hit flash
            a.mesh.material.color.set('#ffffff');

            setTimeout(() => {
              if (a.mesh?.material) {
                a.mesh.material.color.set(
                  'orange'
                );
              }
            }, 50);

            // DESTROY
            if (a.health <= 0) {
              destroyAsteroid(a);

              destroyed = true;
            }

            break;
          }
        }

        if (!destroyed) {
          remaining.push(a);
        }
      }

      asteroids.current = remaining;
    }

    // ==================================================
    // FRAGMENTS
    // ==================================================
    for (
      let i = fragments.current.length - 1;
      i >= 0;
      i--
    ) {
      const f = fragments.current[i];

      f.mesh.position.addScaledVector(
        f.vel,
        delta
      );

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