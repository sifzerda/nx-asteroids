// components/ShipWithBullets.js
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;

export default function Ship({ bulletsRef }) {
  const shipRef = useRef();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotationVel = useRef(0);

  const bullets = useRef([]);
  const lastShot = useRef(0);
  const groupRef = useRef();

  // Ship physics
  const TURN_ACCEL = 3.5;
  const TURN_DAMP = 0.85;
  const THRUST = 12 * WORLD_SCALE;
  const DRAG = 0.99;
  const MAX_SPEED = 12 * WORLD_SCALE;
  const SHIP_HEIGHT = 1.2 * WORLD_SCALE;

  const BULLET_SPEED = 8;
  const BULLET_LIFE = 1.5;

  // Handle keyboard
  useEffect(() => {
    const handleKey = (e, down) => {
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      keys.current[e.code] = down;
    };

    window.addEventListener('keydown', e => handleKey(e, true));
    window.addEventListener('keyup', e => handleKey(e, false));

    return () => {
      window.removeEventListener('keydown', e => handleKey(e, true));
      window.removeEventListener('keyup', e => handleKey(e, false));
    };
  }, []);

  useFrame((_, delta) => {
    // ----- Ship Rotation -----
    if (keys.current['ArrowLeft']) rotationVel.current += TURN_ACCEL * delta;
    if (keys.current['ArrowRight']) rotationVel.current -= TURN_ACCEL * delta;

    rotationVel.current *= TURN_DAMP;
    shipRef.current.rotation.z += rotationVel.current;

    // ----- Ship Thrust -----
    if (keys.current['ArrowUp']) {
      const forward = new THREE.Vector3(0, 1, 0);
      forward.applyEuler(shipRef.current.rotation);
      velocity.current.addScaledVector(forward, THRUST * delta);
    }

    // ----- Physics -----
    velocity.current.multiplyScalar(DRAG);

    const speed = velocity.current.length();
    if (speed > MAX_SPEED) velocity.current.multiplyScalar(MAX_SPEED / speed);

    shipRef.current.position.addScaledVector(velocity.current, delta * 60);

    const limit = 10;
    if (shipRef.current.position.x > limit) shipRef.current.position.x = -limit;
    if (shipRef.current.position.x < -limit) shipRef.current.position.x = limit;
    if (shipRef.current.position.y > limit) shipRef.current.position.y = -limit;
    if (shipRef.current.position.y < -limit) shipRef.current.position.y = limit;

    // ----- Bullets -----
    lastShot.current += delta;
    if (keys.current['Space'] && lastShot.current > 0.25) {
      lastShot.current = 0;

      const forward = new THREE.Vector3(0, 1, 0).applyEuler(shipRef.current.rotation);
      const tipOffset = forward.clone().multiplyScalar(SHIP_HEIGHT / 2);

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

    bullets.current.forEach(b => {
      b.mesh.position.addScaledVector(b.vel, delta);
      b.life -= delta;
    });

    bullets.current = bullets.current.filter(b => {
      if (b.life <= 0) {
        groupRef.current.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        return false;
      }
      return true;
    });
  });

  if (bulletsRef) bulletsRef.current = bullets.current;
  return (
    <>
      <mesh ref={shipRef}>
        <coneGeometry args={[0.5 * WORLD_SCALE, 1.2 * WORLD_SCALE, 3]} />
        <meshBasicMaterial color="cyan" wireframe />
      </mesh>
      <group ref={groupRef} />
    </>
  );
}