import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Matter, { Engine, Render, World, Bodies, Body, Events } from 'matter-js';
import MatterWrap from 'matter-wrap';
import decomp from 'poly-decomp';
import useSound from 'use-sound';

import StartScreen from './StartScreen'; 
import FinalScore from './FinalScore'; 
import HighScores from './HighScores'; 

const Asteroids = () => {
  const [engine] = useState(Engine.create());
  const [shipPosition, setShipPosition] = useState({ x: 300, y: 300, rotation: 0 });
  const [projectiles, setProjectiles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [ship, setShip] = useState(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.15);
  const [asteroidSizes, setAsteroidSizes] = useState([]);
  const [asteroidHits, setAsteroidHits] = useState([]);
  const [score, setScore] = useState(0); // Initialize score at 0
  const [lives, setLives] = useState(3); // Initialize lives at 3
  const [destroyedAsteroids, setDestroyedAsteroids] = useState(0); // Initialize destroyed asteroids count down to 0

  const [startGame, setStartGame] = useState(false); // State to track game start
  const [gameOver, setGameOver] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  
  const gameRef = useRef();
  
  const MAX_PARTICLES = 10;
  const MAX_PROJECTILES = 2;

  const [playShootSound] = useSound('../../public/sounds/01laser.mp3');
  const [playHitSound] = useSound('../../public/sounds/03hit.mp3');

  window.decomp = decomp; // poly-decomp is available globally

  //---------------------------------// START SCREENS //-----------------------------------//

  const startGameHandler = () => {
    setStartGame(true);
  };

  const showHighScorePage = () => {
    setShowHighScores(true);
    console.log('High Scores button clicked', showHighScores);
  };

//------------------------------------------------------------------------------------//

//---// helper function to generate random vertices for generated asteroids //-------//
  const randomVertices = (numVertices, radius) => {
    const vertices = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const x = Math.cos(angle) * (radius * (0.8 + Math.random() * 0.4));
      const y = Math.sin(angle) * (radius * (0.8 + Math.random() * 0.4));
      vertices.push({ x, y });
    }
    return vertices;
  };

  //------------------------// asteroids explode on ship hit //-------------------------//

    // Function to emit explosion particles
    const emitExplosionParticles = (collisionPosition) => {
      const particleCount = 30; 
      const particleSpeed = 5; 
      const particleSpread = Math.PI * 2;
  
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * particleSpread;
        const velocityX = Math.cos(angle) * particleSpeed;
        const velocityY = Math.sin(angle) * particleSpeed;
  
        const particleBody = Bodies.circle(collisionPosition.x, collisionPosition.y, 2, {
          frictionAir: 0,
          restitution: 0.4,
          render: {
            fillStyle: '#ff5e00', // orange
          },
          plugin: {
            wrap: {
              min: { x: 0, y: 0 },
              max: { x: 1650, y: 800 },
            },
          },
        });
  
        Body.setVelocity(particleBody, { x: velocityX, y: velocityY });
        World.add(engine.world, particleBody);
  
        setTimeout(() => {
          World.remove(engine.world, particleBody);
          setParticles((prev) => prev.filter((p) => p.body !== particleBody));
        }, 1000);
      }
    };

    //---------------------------------// ASTEROIDS //-----------------------------------//
const createAsteroid = () => {
  const asteroidRadii = [80, 100, 120, 140, 160];
  const radiusIndex = Math.floor(Math.random() * asteroidRadii.length);
  const radius = asteroidRadii[radiusIndex];
  const numVertices = Math.floor(Math.random() * 5) + 5;
  const vertices = randomVertices(numVertices, radius);

  // Randomize starting position anywhere outside the visible screen
  const startX = Math.random() * 3000 - 750;
  const startY = Math.random() * 1700 - 340;

  // Randomize velocity direction and speed
  const velocityX = (Math.random() - 0.5) * 4;
  const velocityY = (Math.random() - 0.5) * 4;

  const asteroid = Bodies.fromVertices(startX, startY, vertices, {
    frictionAir: 0,
    render: {
      fillStyle: 'transparent',
      strokeStyle: '#ffffff',
      lineWidth: 2,
    },
    plugin: {
      wrap: {
        min: { x: 0, y: 0 },
        max: { x: 1650, y: 800 },
      },
    },
  });

  Body.setVelocity(asteroid, { x: velocityX, y: velocityY });
  Body.setAngularVelocity(asteroid, 0.01); // Adjust angular velocity as needed
  setAsteroids((prev) => [...prev, asteroid]);
  setAsteroidSizes((prev) => [...prev, radius]);
  setAsteroidHits((prev) => [...prev, 0]);
  World.add(engine.world, asteroid);
};

//------------------------// SET UP MATTER.JS GAME OBJECTS //-------------------------//
  
useEffect(() => {

  if (startGame) {

    Matter.use(MatterWrap);
    engine.world.gravity.y = 0;
    const render = Render.create({
      element: gameRef.current,
      engine,
      options: {
        width: 1650,
        height: 800,
        wireframes: false
      }
    });
    Render.run(render);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const vertices = [
      { x: 0, y: 0 },
      { x: 34, y: 14 },
      { x: 0, y: 27 }
    ];

    const shipBody = Bodies.fromVertices(750, 340, vertices, {
      frictionAir: 0.02,
      restitution: 0,
      friction: 0.02,
      render: {
        fillStyle: 'transparent',
        strokeStyle: '#ffffff', 
        lineWidth: 2,
        visible: true // Conditional visibility
      },
      plugin: {
        wrap: {
          min: { x: 0, y: 0 },
          max: { x: 1650, y: 800 }
        }
      }
    });
    Body.rotate(shipBody, -Math.PI / 2);

    setShip(shipBody);
    World.add(engine.world, shipBody);

// Create initial asteroids
for (let i = 0; i < 5; i++) {
  createAsteroid();
}
    // Set up an interval to create new asteroids every 20 seconds
    const intervalId = setInterval(createAsteroid, 20000);

    const updateShipPosition = () => {
      setShipPosition({
        x: shipBody.position.x,
        y: shipBody.position.y,
        rotation: shipBody.angle * (180 / Math.PI)
      });
    };

    Events.on(engine, 'beforeUpdate', updateShipPosition);

    return () => {
      clearInterval(intervalId);
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      Events.off(engine, 'beforeUpdate', updateShipPosition);
    };
  }}, [startGame]);

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
  const makeExhaust = () => {
    if (ship) {
      const exhaustCount = 5;
      const speed = -2;
      const offset = -30;
      const spreadAngle = 0.2;

      const newParticles = [];

      for (let i = 0; i < exhaustCount; i++) {
        const spreadOffset = (i - (exhaustCount - 1) / 2) * spreadAngle;
        const particleX = ship.position.x + Math.cos(ship.angle) * offset;
        const particleY = ship.position.y + Math.sin(ship.angle) * offset;
        const particleBody = Bodies.circle(particleX, particleY, 1, {
          frictionAir: 0.02,
          restitution: 0.4,
          isSensor: true,
          render: {
            fillStyle: '#ff3300' // red
          },
          plugin: {
            wrap: {
              min: { x: 0, y: 0 },
              max: { x: 1650, y: 800 }
            }
          }
        });

        const velocityX = Math.cos(ship.angle + spreadOffset) * speed + (Math.random() - 0.5) * 0.5;
        const velocityY = Math.sin(ship.angle + spreadOffset) * speed + (Math.random() - 0.5) * 0.5;
        Body.setVelocity(particleBody, { x: velocityX, y: velocityY });

        const newParticle = {
          body: particleBody,
          rotation: ship.angle,
          lifetime: 100
        };
        World.add(engine.world, particleBody);

        newParticles.push(newParticle);

        setTimeout(() => {
          World.remove(engine.world, particleBody);
          setParticles(prev => prev.filter(p => p.body !== particleBody));
        }, newParticle.lifetime);
      }

      setParticles(prev => {
        const combinedParticles = [...prev, ...newParticles];
        if (combinedParticles.length > MAX_PARTICLES) {
          return combinedParticles.slice(combinedParticles.length - MAX_PARTICLES);
        }
        return combinedParticles;
      });
    }
  };
//----------------------------------- SHOOTING ------------------------------//
  const shootProjectile = () => {
    if (ship) {
      playShootSound();
      const speed = 10;
      const offset = 40;
      const projectileX = ship.position.x + Math.cos(ship.angle) * offset;
      const projectileY = ship.position.y + Math.sin(ship.angle) * offset;
      const projectileBody = Bodies.rectangle(projectileX, projectileY, 15, 3, {
        frictionAir: 0.01,
        angle: ship.angle,
        isSensor: true,
        render: {
          fillStyle: '#00FFDC' // cyan
        },
        plugin: {
          wrap: {
            min: { x: 0, y: 0 },
            max: { x: 1650, y: 800 }
          }
        }
      });
      const velocityX = Math.cos(ship.angle) * speed;
      const velocityY = Math.sin(ship.angle) * speed;
      Body.setVelocity(projectileBody, { x: velocityX, y: velocityY });
  
      const newProjectile = {
        body: projectileBody,
        rotation: ship.angle,
        lifetime: 100
      };
      World.add(engine.world, projectileBody);
      
      setProjectiles(prev => {
        const updatedProjectiles = [...prev, newProjectile];
        if (updatedProjectiles.length > MAX_PROJECTILES) {
          return updatedProjectiles.slice(updatedProjectiles.length - MAX_PROJECTILES);
        }
        return updatedProjectiles;
      });
  
      setTimeout(() => {
        World.remove(engine.world, projectileBody);
        setProjectiles(prev => prev.filter(proj => proj.body !== projectileBody));
      }, 2000);
  
      // Update score
      setScore(prevScore => {
        const newScore = prevScore + 10; // Adjust score increment as needed
        return newScore;
      });
    }
  };

  // --------------------------------// HOTKEYS //-----------------------------------//

  useHotkeys('up', moveShipUp, [ship]);
  useHotkeys('up', makeExhaust, [ship]);
  useHotkeys('left', rotateShipLeft, [ship, rotationSpeed]);
  useHotkeys('right', rotateShipRight, [ship, rotationSpeed]);
  useHotkeys('space', shootProjectile, [ship]);

  // Handling asteroid and projectile collisions:
  useEffect(() => {
    const handleCollisions = (event) => {
      const pairs = event.pairs;

      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        const isProjectileA = projectiles.find(proj => proj.body === bodyA);
        const isProjectileB = projectiles.find(proj => proj.body === bodyB);
        const isAsteroidA = asteroids.find(ast => ast === bodyA);
        const isAsteroidB = asteroids.find(ast => ast === bodyB);

        if (isProjectileA && isAsteroidB) {
          handleAsteroidCollision(bodyA, bodyB);
        } else if (isProjectileB && isAsteroidA) {
          handleAsteroidCollision(bodyB, bodyA);
        }
      });
    };

    const handleAsteroidCollision = (projectile, asteroid) => {
      // Remove the projectile
      World.remove(engine.world, projectile);
      setProjectiles(prev => prev.filter(proj => proj.body !== projectile));
//---------------------- // impact particles on asteroid fire // ----------------------//
  const emitParticles = () => {
    const particleCount = 5;
    const particleSpeed = 2;
    const particleSpread = 4;

    for (let i = 0; i < particleCount; i++) {
      const particleX = projectile.position.x + (Math.random() - 0.5) * 10;
      const particleY = projectile.position.y + (Math.random() - 0.5) * 10;

      // Generate random number of vertices
      const numVertices = Math.floor(Math.random() * 5) + 5;
      const vertices = [];
      for (let j = 0; j < numVertices; j++) {
        const angle = (j / numVertices) * Math.PI * 2;
        const radius = 2 + Math.random() * 20; // Adjust radius as needed
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        vertices.push({ x, y });
      }

      const particleBody = Bodies.fromVertices(particleX, particleY, vertices, {
        frictionAir: 0,
        restitution: 0.4,
        render: {
          fillStyle: 'transparent', // Transparent fill
          strokeStyle: '#ffffff', // Outline color
          lineWidth: 2 // Outline width
        },
        plugin: {
          wrap: {
            min: { x: 0, y: 0 },
            max: { x: 1650, y: 800 }
          }
        }
      });

      const angle = Math.atan2(particleY - asteroid.position.y, particleX - asteroid.position.x);
      const velocityX = Math.cos(angle + (Math.random() - 0.5) * particleSpread) * particleSpeed;
      const velocityY = Math.sin(angle + (Math.random() - 0.5) * particleSpread) * particleSpeed;
      Body.setVelocity(particleBody, { x: velocityX, y: velocityY });

      setTimeout(() => {
        World.remove(engine.world, particleBody);
        setParticles(prev => prev.filter(p => p.body !== particleBody));
      }, 1000);

      const newParticle = {
        body: particleBody,
        rotation: 0, // Adjust rotation if needed
        lifetime: 1000 // Adjust lifetime if needed
      };

      World.add(engine.world, particleBody);
      setParticles(prev => [...prev, newParticle]);
    }
  };

  emitParticles();
  playHitSound(); // Play hit sound on asteroid collision
//------------------------// HIT ASTEROID SPLITTING // ---------------------------------//
      // Get index of the asteroid
      const asteroidIndex = asteroids.findIndex(ast => ast === asteroid);
      if (asteroidIndex !== -1) {
        // Increment hit count for the asteroid
        const currentHits = asteroidHits[asteroidIndex] + 1;
        const updatedHits = [...asteroidHits];
        updatedHits[asteroidIndex] = currentHits;
        setAsteroidHits(updatedHits);

               // Increment score
               setScore(prevScore => prevScore + 10); // Adjust score increment as needed
  
        // Check if asteroid should be removed
        if (currentHits >= 2) {
          // Remove the asteroid
          World.remove(engine.world, asteroid);
          setAsteroids(prev => prev.filter(ast => ast !== asteroid));
          setAsteroidSizes(prev => prev.filter((size, idx) => idx !== asteroidIndex));
          setAsteroidHits(prev => prev.filter((hits, idx) => idx !== asteroidIndex));

                    // Update the destroyed asteroids count and replace asteroids if needed
                    setDestroyedAsteroids((prev) => prev + 1);

                    if (destroyedAsteroids + 1 === 5) {

                      setDestroyedAsteroids(0);
                    }
        } else {
          // Split the asteroid into smaller ones
          const asteroidRadius = asteroidSizes[asteroidIndex];
          const newRadius = asteroidRadius / 2;

          if (newRadius > 20) { // Ensure the new asteroids are not too small
            const vertices = randomVertices(Math.floor(Math.random() * 5) + 5, newRadius);
            const { x: asteroidX, y: asteroidY } = asteroid.position;
            const velocityX = (Math.random() - 0.5) * 4;
            const velocityY = (Math.random() - 0.5) * 4;
  
            const newAsteroid1 = Bodies.fromVertices(asteroidX, asteroidY, vertices, {
              frictionAir: 0,
              render: {
                fillStyle: 'transparent',
                strokeStyle: '#ffffff',
                lineWidth: 2
              },
              plugin: {
                wrap: {
                  min: { x: 0, y: 0 },
                  max: { x: 1650, y: 800 }
                }
              }
            });
            Body.setVelocity(newAsteroid1, { x: velocityX, y: velocityY });
            World.add(engine.world, newAsteroid1);
            setAsteroids(prev => [...prev, newAsteroid1]);
            setAsteroidSizes(prev => [...prev, newRadius]);
            setAsteroidHits(prev => [...prev, 0]);
  
            const newAsteroid2 = Bodies.fromVertices(asteroidX, asteroidY, vertices, {
              frictionAir: 0,
              render: {
                fillStyle: 'transparent',
                strokeStyle: '#ffffff',
                lineWidth: 2
              },
              plugin: {
                wrap: {
                  min: { x: 0, y: 0 },
                  max: { x: 1650, y: 800 }
                }
              }
            });
            Body.setVelocity(newAsteroid2, { x: -velocityX, y: -velocityY });
            World.add(engine.world, newAsteroid2);
            setAsteroids(prev => [...prev, newAsteroid2]);
            setAsteroidSizes(prev => [...prev, newRadius]);
            setAsteroidHits(prev => [...prev, 0]);
          }
        }
      }
    };

    Events.on(engine, 'collisionStart', handleCollisions);

    return () => {
      Events.off(engine, 'collisionStart', handleCollisions);
    };
  }, [engine, projectiles, asteroids, asteroidSizes, asteroidHits]);

  //---------------------------------- // CRASH HANDLING //---------------------------------------//

  useEffect(() => {
    const handleCollisions = (event) => {
      const pairs = event.pairs;
  
      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
  
        const isShipA = bodyA === ship;
        const isShipB = bodyB === ship;
        const isAsteroidA = asteroids.find(ast => ast === bodyA);
        const isAsteroidB = asteroids.find(ast => ast === bodyB);
  
        if ((isShipA && isAsteroidB) || (isShipB && isAsteroidA)) {
//----------------------------------- expel ship parts --------------------------------------------//
          const emitCrash = (shipBody) => {
            const pieceCount = 10;
            const pieceSpeed = 10;
            const pieceSpread = 4;
          
            for (let i = 0; i < pieceCount; i++) {
              const pieceX = shipBody.position.x + (Math.random() - 0.5) * 10;
              const pieceY = shipBody.position.y + (Math.random() - 0.5) * 10;
          
              // Generate random number of vertices
              const numVertices = Math.floor(Math.random() * 5) + 5;
              const vertices = [];
              for (let j = 0; j < numVertices; j++) {
                const angle = (j / numVertices) * Math.PI * 2;
                const radius = 2 + Math.random() * 20; // Adjust radius as needed
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                vertices.push({ x, y });
              }
          // ship parts:
              const pieceBody = Bodies.fromVertices(pieceX, pieceY, vertices, {
                frictionAir: 0,
                restitution: 0.4,
                render: {
                  fillStyle: 'transparent', // Transparent fill
                  strokeStyle: '#ffffff', // Outline color
                  lineWidth: 2 // Outline width
                },
                plugin: {
                  wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: 1650, y: 800 }
                  }
                }
              });
          
              const angle = Math.atan2(pieceY - shipBody.position.y, pieceX - shipBody.position.x);
              const velocityX = Math.cos(angle + (Math.random() - 0.5) * pieceSpread) * pieceSpeed;
              const velocityY = Math.sin(angle + (Math.random() - 0.5) * pieceSpread) * pieceSpeed;
              Body.setVelocity(pieceBody, { x: velocityX, y: velocityY });
          
              setTimeout(() => {
                World.remove(engine.world, pieceBody);
                setParticles(prev => prev.filter(p => p.body !== pieceBody));
                // crash takes 5 secs to disappear
              }, 5000);
          
              const newPiece = {
                body: pieceBody,
                rotation: 5, // Adjust rotation if needed
                lifetime: 1000 // Adjust lifetime if needed
              };
          
              World.add(engine.world, pieceBody);
              setParticles(prev => [...prev, newPiece]);
            }
          };
          emitCrash(ship); // ship explodes on crash
          ship.render.visible = false; // ship disappears on crash

      // Calculate collision position as the midpoint between bodyA and bodyB
      const collisionPosition = {
        x: (bodyA.position.x + bodyB.position.x) / 2,
        y: (bodyA.position.y + bodyB.position.y) / 2,
      };
//------------------------------------ subtract life on crash ------------------------------------------//
           if (lives === 0) {
            setGameOver(true);
            emitCrash(ship); // trigger when ship collides with asteroid
            emitExplosionParticles(collisionPosition);
// Gameover: 5 sec Timeout before final score screen -----//
            setTimeout(() => {
              setShowFinalScore(true);
              }, 5000); // 5 secs before final score screen
// -------------------------------------------------------//
           } else {
            setLives(prevLives => {
              const updatedLives = prevLives - 1;
                
                emitExplosionParticles(collisionPosition); // asteroid explodes on crash
                          // Remove all asteroids
          asteroids.forEach((asteroid) => {
            World.remove(engine.world, asteroid);
          });
//------------------------// 5 sec Timeout: reset ship, asteroids //---------------------//
setTimeout(() => {
     Body.setPosition(ship, { x: 790, y: 350 }); // reset ship pos to center
     Body.setVelocity(ship, { x: 0, y: 0 }); // Reset ship velocity 
     Body.setAngularVelocity(ship, 0); // Reset ship angular velocity
// Create more asteroids (reset them)
for (let i = 0; i < 5; i++) {
  createAsteroid();
}
  setGameOver(false);
  ship.render.visible = true; // ship reappears new life

}, 4000); // 4secs before reset
//-----------------------------------------------------------------------------------------//
              return updatedLives;
            });
           }
        }
      });
    };

    Events.on(engine, 'collisionStart', handleCollisions);
  
    return () => {
      Events.off(engine, 'collisionStart', handleCollisions);
    };
  }, [engine, ship, asteroids, gameOver]);

//--------------------------------// CLOCKING SCORE //----------------------------------//

useEffect(() => {
  // Continuous score increment example
  const scoreInterval = setInterval(() => {
    if (!gameOver) {
      setScore(prevScore => prevScore + 1); // Increment score by 1 point every second
    }
  }, 100); 

  return () => clearInterval(scoreInterval); // Cleanup on unmount
}, [gameOver]);

// --------------------------------// SCREEN SELECTION //----------------------------------//

if (showHighScores) {
  return <HighScores />;
}

if (showFinalScore) {
  return <FinalScore score={score} onHighScores={showHighScorePage} />;
}

//----------------------------------// RENDERING //----------------------------------//

return (
  <div>
    {!startGame && <StartScreen onStart={startGameHandler} onHighScores={showHighScorePage} />}
    {startGame && (
      <div className="game-container" ref={gameRef}>
        {/* Your existing game rendering code */}
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over">
              Game Over
            </div>
          </div>
        )}
        <div className="score-display">
          Score: {score}
        </div>
        <div className="lives-display">
          Lives: <span className='life-triangle'>{'∆ '.repeat(lives)}</span>
        </div>
      </div>
    )}
  </div>
);
};

export default Asteroids;
