// components/ShipWithBullets.js
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;
const MAX_PARTICLES = 500;

export default function Ship({ bulletsRef }) {
  const shipRef = useRef();
  const keys = useRef({});

  // Physics
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotationVel = useRef(0);

  // Ship constants
  const TURN_ACCEL = 3.5;
  const TURN_DAMP = 0.85;
  const THRUST = 12 * WORLD_SCALE;
  const DRAG = 0.99;
  const MAX_SPEED = 12 * WORLD_SCALE;
  const SHIP_HEIGHT = 1.2 * WORLD_SCALE;

  // Bullets
  const bullets = useRef([]);
  const lastShot = useRef(0);
  const groupRef = useRef();

  const BULLET_SPEED = 8;
  const BULLET_LIFE = 1.5;

  // 🔥 Particle system (GPU-friendly)
  const particleGeom = useRef();

  const particleData = useRef({
    positions: new Float32Array(MAX_PARTICLES * 3),
    velocities: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
    maxLife: new Float32Array(MAX_PARTICLES),
    colors: new Float32Array(MAX_PARTICLES * 3),
    index: 0,
  });

  // --- keyboard input (FIXED cleanup) ---
  useEffect(() => {
    const handleKey = (e, down) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      )
        e.preventDefault();
      keys.current[e.code] = down;
    };

    const downHandler = (e) => handleKey(e, true);
    const upHandler = (e) => handleKey(e, false);

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  // expose bullets
  useEffect(() => {
    if (bulletsRef) bulletsRef.current = bullets.current;
  }, [bulletsRef]);

  useFrame((_, delta) => {
    if (!shipRef.current) return;

    // --- rotation ---
    if (keys.current['ArrowLeft']) rotationVel.current += TURN_ACCEL * delta;
    if (keys.current['ArrowRight']) rotationVel.current -= TURN_ACCEL * delta;
    rotationVel.current *= TURN_DAMP;
    shipRef.current.rotation.z += rotationVel.current;

    // --- thrust + particle spawn ---
    if (keys.current['ArrowUp']) {
      const forward = new THREE.Vector3(0, 1, 0).applyEuler(
        shipRef.current.rotation
      );
      velocity.current.addScaledVector(forward, THRUST * delta);

      const backward = forward.clone().multiplyScalar(-1);
      const basePos = shipRef.current.position
        .clone()
        .add(backward.clone().multiplyScalar(SHIP_HEIGHT * 0.6));

      for (let i = 0; i < 5; i++) {
        const idx = particleData.current.index;
        const i3 = idx * 3;

        // position
        particleData.current.positions[i3 + 0] = basePos.x;
        particleData.current.positions[i3 + 1] = basePos.y;
        particleData.current.positions[i3 + 2] = basePos.z;

        // start bright yellow
        particleData.current.colors[i3 + 0] = 1.0; // R
        particleData.current.colors[i3 + 1] = 0.9; // G
        particleData.current.colors[i3 + 2] = 0.2; // B

        // velocity (spread)
        const spreadX = (Math.random() - 0.5) * 0.6;
        const spreadY = (Math.random() - 0.5) * 0.6;

        particleData.current.velocities[i3 + 0] =
          backward.x * 2 + spreadX;
        particleData.current.velocities[i3 + 1] =
          backward.y * 2 + spreadY;
        particleData.current.velocities[i3 + 2] = 0;

        // life
        particleData.current.life[idx] = 0.5;
        particleData.current.maxLife[idx] = 0.5;

        // ring buffer advance
        particleData.current.index =
          (idx + 1) % MAX_PARTICLES;
      }
    }

    // --- physics ---
    velocity.current.multiplyScalar(DRAG);
    const speed = velocity.current.length();
    if (speed > MAX_SPEED)
      velocity.current.multiplyScalar(MAX_SPEED / speed);

    shipRef.current.position.addScaledVector(velocity.current, delta * 60);

    // --- screen wrap ---
    const limit = 10;
    if (shipRef.current.position.x > limit)
      shipRef.current.position.x = -limit;
    if (shipRef.current.position.x < -limit)
      shipRef.current.position.x = limit;
    if (shipRef.current.position.y > limit)
      shipRef.current.position.y = -limit;
    if (shipRef.current.position.y < -limit)
      shipRef.current.position.y = limit;

    // --- shoot bullets ---
    lastShot.current += delta;
    if (keys.current['Space'] && lastShot.current > 0.25) {
      lastShot.current = 0;

      const forward = new THREE.Vector3(0, 1, 0).applyEuler(
        shipRef.current.rotation
      );
      const tipOffset = forward
        .clone()
        .multiplyScalar(SHIP_HEIGHT / 2);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#FFFF00' })
      );

      mesh.position.copy(shipRef.current.position).add(tipOffset);

      bullets.current.push({
        mesh,
        vel: forward.multiplyScalar(BULLET_SPEED),
        life: BULLET_LIFE,
      });

      groupRef.current.add(mesh);
    }

    // --- update bullets ---
    bullets.current.forEach((b) => {
      b.mesh.position.addScaledVector(b.vel, delta);
      b.life -= delta;
    });

    for (let i = bullets.current.length - 1; i >= 0; i--) {
      if (bullets.current[i].life <= 0) {
        groupRef.current.remove(bullets.current[i].mesh);
        bullets.current[i].mesh.geometry.dispose();
        bullets.current[i].mesh.material.dispose();
        bullets.current.splice(i, 1);
      }
    }

    // 🔥 update particles
    const positions = particleData.current.positions;
    const velocities = particleData.current.velocities;
    const colors = particleData.current.colors;
    const life = particleData.current.life;
    const maxLife = particleData.current.maxLife;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (life[i] > 0) {
        const i3 = i * 3;

        // movement
        positions[i3 + 0] += velocities[i3 + 0] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;

        // 🔥 velocity damping (natural spread)
        velocities[i3 + 0] *= 0.96;
        velocities[i3 + 1] *= 0.96;

        life[i] -= delta;

        const t = life[i] / maxLife[i]; // 1 → 0

        // 🔥 COLOR GRADIENT
        // yellow → orange → red → dark
        colors[i3 + 0] = 2.0;          // red stays strong
        colors[i3 + 1] = t * 1.2;      // green fades
        colors[i3 + 2] = t * 0.3;      // blue fades fast

        // shrink effect (fake by collapsing)
        if (life[i] <= 0) {
          positions[i3 + 0] = 9999;
          positions[i3 + 1] = 9999;
        }
      }
    }

    particleGeom.current.geometry.attributes.position.needsUpdate = true;
    particleGeom.current.geometry.attributes.color.needsUpdate = true;

    if (particleGeom.current) {
      particleGeom.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ship */}
      <mesh ref={shipRef}>
        <coneGeometry args={[0.5 * WORLD_SCALE, 1.2 * WORLD_SCALE, 3]} />
        <meshBasicMaterial color="cyan" wireframe />
      </mesh>

      {/* Bullets */}
      <group ref={groupRef} />

      {/* 🔥 Exhaust particles */}
      <points ref={particleGeom}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_PARTICLES}
            array={particleData.current.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={MAX_PARTICLES}
            array={particleData.current.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}