// components/Matter.js
// this is asteroids game in matter-js

'use client';

import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Matter, { Engine, Render, World, Bodies, Body, Events } from 'matter-js';
import decomp from 'poly-decomp';
import MatterWrap from 'matter-wrap';

const MatterGame = () => {
    const [engine] = useState(Engine.create());
    const [shipPosition, setShipPosition] = useState({ x: 300, y: 300, rotation: 0 });



    const [ship, setShip] = useState(null);
    const [rotationSpeed] = useState(0.15);


    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    const [gameOver, setGameOver] = useState(false);

    const gameRef = useRef();


    //const decomp = require('poly-decomp');
    //const MatterWrap = require('matter-wrap');

    //window.decomp = decomp; // poly-decomp is available globally

    //---------------------------------// ASTEROIDS UTILS //-----------------------------------//


    //------------------------// asteroids explode on ship hit //-------------------------//

    // Function to emit explosion particles


    //------------------------// a



    //---------------------------------// MATTER.JS SETUP //-----------------------------------//
    useEffect(() => {
        window.decomp = decomp;
        Matter.use(MatterWrap);
        engine.world.gravity.y = 0;

        const container = gameRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const render = Render.create({
            element: container,
            engine,
            options: {
                width,
                height,
                wireframes: false,
                background: '#000',
            },
        });
        Render.run(render);

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);

        // Ship body
        const vertices = [{ x: 0, y: 0 }, { x: 34, y: 14 }, { x: 0, y: 27 }];

        const shipBody = Bodies.fromVertices(width / 2, height / 2, vertices, {
            frictionAir: 0.02,
            restitution: 0,
            friction: 0.02,
            render: {
                fillStyle: 'transparent',
                strokeStyle: '#ffffff',
                lineWidth: 2,
                visible: true,
            },
            plugin: {
                wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: width, y: height },
                },
            },
        });

        Body.rotate(shipBody, -Math.PI / 2);
        setShip(shipBody);
        World.add(engine.world, shipBody);

        // Create initial asteroids

        // Set up an interval to create new asteroids every 20 seconds


        const updateShipPosition = () => {
            setShipPosition({
                x: shipBody.position.x,
                y: shipBody.position.y,
                rotation: shipBody.angle * (180 / Math.PI)
            });
        };

        Events.on(engine, 'beforeUpdate', updateShipPosition);

return () => {
    Render.stop(render);
    Matter.Runner.stop(runner);
    World.clear(engine.world);
    Engine.clear(engine);

    if (render.canvas) {
        render.canvas.remove();
    }

    render.textures = {};

    Events.off(engine, 'beforeUpdate', updateShipPosition);
};
    }, []);

    //---------------------------------// HOTKEYS //-----------------------------------//

    const moveShipUp = () => {
        if (ship) {
            const forceMagnitude = 0.0005;
            const forceX = Math.cos(ship.angle) * forceMagnitude;
            const forceY = Math.sin(ship.angle) * forceMagnitude;
            Body.applyForce(ship, ship.position, { x: forceX, y: forceY });
        }
    };

    const rotateShipLeft = () => {
        if (ship) {
            Body.rotate(ship, -rotationSpeed);
        }
    };

    const rotateShipRight = () => {
        if (ship) {
            Body.rotate(ship, rotationSpeed);
        }
    };

    //-------------------------------- SHIP EXHAUST PARTICLES ---------------------------//


    //----------------------------------- SHOOTING ------------------------------//


    // --------------------------------// HOTKEYS //-----------------------------------//

    useHotkeys('up', moveShipUp, [ship]);

    useHotkeys('left', rotateShipLeft, [ship, rotationSpeed]);
    useHotkeys('right', rotateShipRight, [ship, rotationSpeed]);


    // Handling asteroid and projectile collisions:

    //---------------------------------- // CRASH HANDLING //---------------------------------------//


    //--------------------------------// CLOCKING SCORE //----------------------------------//



    //---------------------------------// RENDERING //-----------------------------------//
    return (
        <div className="w-full max-w-4xl mx-auto mt-4">

            <div
                ref={gameRef}
                className="w-full h-[500px] border border-gray-700 rounded-xl overflow-hidden"
            />

        </div>

    );
};

export default MatterGame;
















