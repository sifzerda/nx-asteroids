// components/Asteroids.js
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const WORLD_SCALE = 0.5;

function Ship({ shipRef }) {
    const keys = useRef({});

    // physics state (not React state — important)
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const rotationVel = useRef(0);

    // tuned values (important)
    const TURN_ACCEL = 3.5;
    const TURN_DAMP = 0.85;
    const THRUST = 12 * WORLD_SCALE;
    const DRAG = 0.99;
    const MAX_SPEED = 12 * WORLD_SCALE;

    useEffect(() => {
const down = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault(); // 🚫 stop scrolling
    }
    keys.current[e.code] = true;
};

const up = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    keys.current[e.code] = false;
};

        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);

        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    useFrame((_, delta) => {
        const k = keys.current;

        // ===== ROTATION (fixed + smoother) =====
        if (k['ArrowLeft']) rotationVel.current += TURN_ACCEL * delta;
        if (k['ArrowRight']) rotationVel.current -= TURN_ACCEL * delta;

        // apply damping
        rotationVel.current *= TURN_DAMP;
        shipRef.current.rotation.z += rotationVel.current;

        // ===== THRUST =====
        if (k['ArrowUp']) {
            const forward = new THREE.Vector3(0, 1, 0); // cone points up

            forward.applyEuler(shipRef.current.rotation);
            velocity.current.addScaledVector(forward, THRUST * delta);
        }

        // ===== PHYSICS =====
        velocity.current.multiplyScalar(DRAG);

        // clamp speed
        const speed = velocity.current.length();
        if (speed > MAX_SPEED) {
            velocity.current.multiplyScalar(MAX_SPEED / speed);
        }

        shipRef.current.position.addScaledVector(velocity.current, delta * 60);

        // screen wrap (simple bounds)
        const limit = 10;
        if (shipRef.current.position.x > limit) shipRef.current.position.x = -limit;
        if (shipRef.current.position.x < -limit) shipRef.current.position.x = limit;
        if (shipRef.current.position.y > limit) shipRef.current.position.y = -limit;
        if (shipRef.current.position.y < -limit) shipRef.current.position.y = limit;
    });

    return (
        <mesh ref={shipRef}>
            <coneGeometry args={[0.5 * WORLD_SCALE, 1.2 * WORLD_SCALE, 3]} />
            <meshBasicMaterial color="cyan" wireframe />
        </mesh>
    );
}

function BulletSystem({ shipRef }) {
  const bullets = useRef([]);
  const keys = useRef({});
  const lastShot = useRef(0);
  const groupRef = useRef();

  const BULLET_SPEED = 8;
  const BULLET_LIFE = 1.5;
  const WORLD_SCALE = 0.5;
  const SHIP_HEIGHT = 1.2 * WORLD_SCALE; // same as ship geometry

  useEffect(() => {
    const handleKey = (e, down) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
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
    lastShot.current += delta;

    if (keys.current['Space'] && lastShot.current > 0.25 && shipRef.current) {
      lastShot.current = 0;

      // use unit vector along local Y axis and rotate to ship orientation
      const forward = new THREE.Vector3(0, 1, 0);
      forward.applyEuler(shipRef.current.rotation);

      // tip offset along forward direction
      const tipOffset = forward.clone().multiplyScalar(SHIP_HEIGHT / 2);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16), // sphere bullet
        new THREE.MeshBasicMaterial({ color: '#FFFF00' }) // neon yellow
      );

      mesh.position.copy(shipRef.current.position).add(tipOffset);

      bullets.current.push({
        mesh,
        vel: forward.multiplyScalar(BULLET_SPEED), // bullet velocity along forward
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

  return <group ref={groupRef} />;
}

export default function Page() {
    const shipRef = useRef();

    return (
        <Canvas
            tabIndex={0}
            onClick={(e) => e.target.focus()}
            camera={{ position: [0, 0, 10] }}
            style={{
                background: 'black',
                width: '600px',    
                height: '600px',    
                border: '1px solid cyan',
                boxSizing: 'border-box',
            }}
        >
            <Ship shipRef={shipRef} />
            <BulletSystem shipRef={shipRef} />

            <EffectComposer>
                <Bloom intensity={1.5} luminanceThreshold={0.2} />
            </EffectComposer>
        </Canvas>
    );
}