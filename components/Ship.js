// components/ShipWithBullets.js
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;

const MAX_PARTICLES = 1000;
const BULLET_TRAIL_PARTICLES = 3;

export default function Ship({ bulletsRef }) {
  const shipRef = useRef();
  const groupRef = useRef();
  const particleGeom = useRef();

  const keys = useRef({});

  // -----------------------------
  // Physics
  // -----------------------------
  const velocity = useRef(new THREE.Vector3());
  const rotationVel = useRef(0);

  // -----------------------------
  // Ship settings
  // -----------------------------
  const TURN_ACCEL = 3.5;
  const TURN_DAMP = 0.85;

  const THRUST = 12 * WORLD_SCALE;
  const DRAG = 0.99;
  const MAX_SPEED = 12 * WORLD_SCALE;

  const SHIP_HEIGHT = 1.2 * WORLD_SCALE;

  // -----------------------------
  // Bullets
  // -----------------------------
  const bullets = useRef([]);
  const lastShot = useRef(0);

  const BULLET_SPEED = 18;
  const BULLET_LIFE = 1.2;

  // -----------------------------
  // Glow texture for arcade shots
  // -----------------------------
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

    const tex = new THREE.CanvasTexture(canvas);

    return tex;
  }, []);

  // -----------------------------
  // GPU particle system
  // -----------------------------
  const particleData = useRef({
    positions: new Float32Array(MAX_PARTICLES * 3),
    velocities: new Float32Array(MAX_PARTICLES * 3),
    colors: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
    maxLife: new Float32Array(MAX_PARTICLES),
    sizes: new Float32Array(MAX_PARTICLES),
    index: 0,
  });

  // -----------------------------
  // Keyboard input
  // -----------------------------
  useEffect(() => {
    const handleKey = (e, down) => {
      if (
        [
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

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
    if (bulletsRef) {
      bulletsRef.current = bullets.current;
    }
  }, [bulletsRef]);

  // -----------------------------
  // Particle spawner
  // -----------------------------
  const spawnParticle = ({
    position,
    velocity,
    color,
    life = 0.4,
  }) => {
    const idx = particleData.current.index;
    const i3 = idx * 3;

    particleData.current.positions[i3 + 0] = position.x;
    particleData.current.positions[i3 + 1] = position.y;
    particleData.current.positions[i3 + 2] = position.z;

    particleData.current.velocities[i3 + 0] = velocity.x;
    particleData.current.velocities[i3 + 1] = velocity.y;
    particleData.current.velocities[i3 + 2] = velocity.z;

    particleData.current.colors[i3 + 0] = color[0];
    particleData.current.colors[i3 + 1] = color[1];
    particleData.current.colors[i3 + 2] = color[2];

    particleData.current.life[idx] = life;
    particleData.current.maxLife[idx] = life;

    particleData.current.index =
      (idx + 1) % MAX_PARTICLES;
  };

  // -----------------------------
  // Frame update
  // -----------------------------
  useFrame((state, delta) => {
    if (!shipRef.current) return;

    // -----------------------------
    // Rotation
    // -----------------------------
    if (keys.current['ArrowLeft']) {
      rotationVel.current += TURN_ACCEL * delta;
    }

    if (keys.current['ArrowRight']) {
      rotationVel.current -= TURN_ACCEL * delta;
    }

    rotationVel.current *= TURN_DAMP;

    shipRef.current.rotation.z += rotationVel.current;

    // -----------------------------
    // Thrust
    // -----------------------------
    if (keys.current['ArrowUp']) {
      const forward = new THREE.Vector3(0, 1, 0).applyEuler(
        shipRef.current.rotation
      );

      velocity.current.addScaledVector(
        forward,
        THRUST * delta
      );

      // exhaust particles
      const backward = forward.clone().multiplyScalar(-1);

      const basePos = shipRef.current.position
        .clone()
        .add(backward.clone().multiplyScalar(0.6));

      for (let i = 0; i < 6; i++) {
        const spreadX = (Math.random() - 0.5) * 0.8;
        const spreadY = (Math.random() - 0.5) * 0.8;

        spawnParticle({
          position: basePos,
          velocity: new THREE.Vector3(
            backward.x * 3 + spreadX,
            backward.y * 3 + spreadY,
            0
          ),
          color: [4.0, 1.5, 0.2],
          life: 0.45,
        });
      }
    }

    // -----------------------------
    // Physics
    // -----------------------------
    velocity.current.multiplyScalar(DRAG);

    const speed = velocity.current.length();

    if (speed > MAX_SPEED) {
      velocity.current.multiplyScalar(
        MAX_SPEED / speed
      );
    }

    shipRef.current.position.addScaledVector(
      velocity.current,
      delta * 60
    );

    // -----------------------------
    // Screen wrap
    // -----------------------------
    const limit = 10;

    if (shipRef.current.position.x > limit)
      shipRef.current.position.x = -limit;

    if (shipRef.current.position.x < -limit)
      shipRef.current.position.x = limit;

    if (shipRef.current.position.y > limit)
      shipRef.current.position.y = -limit;

    if (shipRef.current.position.y < -limit)
      shipRef.current.position.y = limit;

    // -----------------------------
    // Shoot
    // -----------------------------
    lastShot.current += delta;

    if (
      keys.current['Space'] &&
      lastShot.current > 0.12
    ) {
      lastShot.current = 0;

      const forward = new THREE.Vector3(0, 1, 0).applyEuler(
        shipRef.current.rotation
      );

      const tipOffset = forward
        .clone()
        .multiplyScalar(SHIP_HEIGHT / 2);

      // ARCADE GLOW BULLET
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

      mesh.position
        .copy(shipRef.current.position)
        .add(tipOffset);

      // rotate sprite toward movement direction
      material.rotation =
        Math.atan2(forward.y, forward.x) -
        Math.PI / 2;

      bullets.current.push({
        mesh,
        vel: forward.multiplyScalar(BULLET_SPEED),
        life: BULLET_LIFE,
        pulseOffset: Math.random() * 100,
      });

      groupRef.current.add(mesh);

      // muzzle flash burst
      for (let i = 0; i < 10; i++) {
        spawnParticle({
          position: mesh.position.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            0
          ),
          color: [5.0, 1.0, 4.0],
          life: 0.18,
        });
      }
    }

    // -----------------------------
    // Update bullets
    // -----------------------------
    bullets.current.forEach((b) => {
      b.mesh.position.addScaledVector(
        b.vel,
        delta
      );

      b.life -= delta;

      // FLASHING ARCADE PULSE
      const pulse =
        1 +
        Math.sin(
          performance.now() * 0.03 + b.pulseOffset
        ) *
          0.35;

      b.mesh.scale.set(
        0.45 * pulse,
        1.8 * pulse,
        1
      );

      b.mesh.material.opacity = 1.4 * pulse;

      // TRAIL PARTICLES
      for (let i = 0; i < BULLET_TRAIL_PARTICLES; i++) {
        spawnParticle({
          position: b.mesh.position.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            0
          ),
          color: [4.0, 0.5, 5.0],
          life: 0.12,
        });
      }
    });

    // remove bullets
    for (
      let i = bullets.current.length - 1;
      i >= 0;
      i--
    ) {
      if (bullets.current[i].life <= 0) {
        groupRef.current.remove(
          bullets.current[i].mesh
        );

        bullets.current[i].mesh.material.dispose();

        bullets.current.splice(i, 1);
      }
    }

    // -----------------------------
    // Update particles
    // -----------------------------
    const positions =
      particleData.current.positions;

    const velocities =
      particleData.current.velocities;

    const colors =
      particleData.current.colors;

    const life = particleData.current.life;
    const maxLife =
      particleData.current.maxLife;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (life[i] > 0) {
        const i3 = i * 3;

        positions[i3 + 0] +=
          velocities[i3 + 0] * delta;

        positions[i3 + 1] +=
          velocities[i3 + 1] * delta;

        velocities[i3 + 0] *= 0.94;
        velocities[i3 + 1] *= 0.94;

        life[i] -= delta;

        const t = life[i] / maxLife[i];

        // FADE COLORS
        colors[i3 + 0] *= 0.985;
        colors[i3 + 1] *= 0.975;
        colors[i3 + 2] *= 0.965;

        if (life[i] <= 0) {
          positions[i3 + 0] = 9999;
          positions[i3 + 1] = 9999;
          positions[i3 + 2] = 9999;
        }
      }
    }

    // update GPU buffers
    if (particleGeom.current) {
      particleGeom.current.geometry.attributes.position.needsUpdate = true;

      particleGeom.current.geometry.attributes.color.needsUpdate = true;
    }

    // subtle arcade screenshake
    state.camera.position.x =
      (Math.random() - 0.5) * 0.01;

    state.camera.position.y =
      (Math.random() - 0.5) * 0.01;
  });

  return (
    <>
      {/* SHIP */}
      <mesh ref={shipRef}>
        <coneGeometry
          args={[
            0.5 * WORLD_SCALE,
            1.2 * WORLD_SCALE,
            3,
          ]}
        />

        <meshBasicMaterial
          color="cyan"
          wireframe
        />
      </mesh>

      {/* BULLETS */}
      <group ref={groupRef} />

      {/* PARTICLES */}
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
          size={0.28}
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