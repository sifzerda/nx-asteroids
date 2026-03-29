// components/Asteroids.js
'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Ship from './Ship';
import Rocks from './Rocks';

export default function Asteroids() {
    const bulletsRef = useRef();

  return (
    <Canvas
      tabIndex={0}
      onClick={e => e.target.focus()}
      camera={{ position: [0, 0, 10] }}
      style={{
        background: 'black',
        width: '600px',
        height: '600px',
        border: '1px solid cyan',
        boxSizing: 'border-box',
      }}
    >
      <Ship bulletsRef={bulletsRef} />
      <Rocks bulletsRef={bulletsRef} />

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.2} />
      </EffectComposer>
    </Canvas>
  );
}