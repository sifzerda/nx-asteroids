// components/Asteroids.js
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function Ship() {
    const ref = useRef();
    const keys = useRef({});

    // physics state (not React state — important)
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const rotationVel = useRef(0);

    // tuned values (important)
    const TURN_ACCEL = 3.5;   // how fast rotation builds
    const TURN_DAMP = 0.85;   // rotation friction
    const THRUST = 12;        // acceleration
    const DRAG = 0.99;
    const MAX_SPEED = 12;

    useEffect(() => {
        const down = (e) => (keys.current[e.code] = true);
        const up = (e) => (keys.current[e.code] = false);

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
        ref.current.rotation.z += rotationVel.current;

        // ===== THRUST =====
        if (k['ArrowUp']) {
            const forward = new THREE.Vector3(0, 1, 0); // cone points up

            forward.applyEuler(ref.current.rotation);
            velocity.current.addScaledVector(forward, THRUST * delta);
        }

        // ===== PHYSICS =====
        velocity.current.multiplyScalar(DRAG);

        // clamp speed
        const speed = velocity.current.length();
        if (speed > MAX_SPEED) {
            velocity.current.multiplyScalar(MAX_SPEED / speed);
        }

        ref.current.position.addScaledVector(velocity.current, delta * 60);

        // screen wrap (simple bounds)
        const limit = 10;
        if (ref.current.position.x > limit) ref.current.position.x = -limit;
        if (ref.current.position.x < -limit) ref.current.position.x = limit;
        if (ref.current.position.y > limit) ref.current.position.y = -limit;
        if (ref.current.position.y < -limit) ref.current.position.y = limit;
    });

    return (
        <mesh ref={ref}>
            {/* Make sure the cone points UP */}
            <coneGeometry args={[0.5, 1.2, 3]} />
            <meshBasicMaterial color="cyan" wireframe />
        </mesh>
    );
}

function BulletSystem() {
    const bullets = useRef([]);

    const keys = useRef({});
    const lastShot = useRef(0);

    useEffect(() => {
        const down = (e) => (keys.current[e.code] = true);
        const up = (e) => (keys.current[e.code] = false);

        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);

        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // shoot
        if (keys.current['Space'] && time - lastShot.current > 0.15) {
            lastShot.current = time;

            const ship = state.scene.children.find(obj => obj.type === 'Mesh');

            if (ship) {
                const dir = new THREE.Vector3(
                    Math.sin(ship.rotation.z),
                    Math.cos(ship.rotation.z),
                    0
                );

                bullets.current.push({
                    pos: ship.position.clone(),
                    vel: dir.multiplyScalar(20),
                    life: 1.5,
                });
            }
        }

        bullets.current.forEach(b => {
            b.pos.addScaledVector(b.vel, delta);
            b.life -= delta;
        });

        bullets.current = bullets.current.filter(b => b.life > 0);
    });

    return (
        <>
            {bullets.current.map((b, i) => (
                <mesh key={i} position={b.pos}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="cyan" />
                </mesh>
            ))}
        </>
    );
}

export default function Page() {
    return (
        <Canvas
            camera={{ position: [0, 0, 15] }}
            style={{ background: 'black', height: '100vh', border: '1px solid cyan', boxSizing: 'border-box', }}
        >
            <Ship />
            <BulletSystem />
            {/* 👇 ADD IT HERE (at the end is best) */}
            <EffectComposer>
                <Bloom intensity={1.5} luminanceThreshold={0.2} />
            </EffectComposer>
        </Canvas>
    );
}