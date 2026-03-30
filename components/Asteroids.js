// components/Asteroids.js
// this is asteroids game in react-three-fiber
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Ship from './Ship';
import Rocks from './Rocks';

export default function Asteroids() {
  const bulletsRef = useRef();
  const containerRef = useRef();
  const [size, setSize] = useState({ width: 600, height: 600 });

  // Update canvas size on window resize
  useEffect(() => {
    const container = containerRef.current;

    const updateSize = () => {
      if (container) {
        const width = container.clientWidth;
        const height = container.clientWidth; // keep square aspect ratio
        setSize({ width, height });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize(); // initial sizing

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto mt-4"
      style={{ aspectRatio: '1 / 1' }} // keep square
    >
      <Canvas
        tabIndex={0}
        onClick={e => e.target.focus()}
        camera={{ position: [0, 0, 10] }}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          background: 'black',
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
    </div>
  );
}