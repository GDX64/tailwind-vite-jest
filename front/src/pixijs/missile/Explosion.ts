import { Container } from 'pixi.js';
import { Emitter } from '@pixi/particle-emitter';

export function explode(container: Container, [x, y]: [number, number]) {
  const emitter = new Emitter(container, explosionConfig(x, y));
  emitter.playOnceAndDestroy(() => console.log('end'));
}
function explosionConfig(x: number, y: number) {
  return {
    lifetime: {
      min: 0.5,
      max: 0.5,
    },
    frequency: 0.008,
    emitterLifetime: 0.31,
    maxParticles: 1000,
    addAtBack: false,
    pos: {
      x,
      y,
    },
    behaviors: [
      {
        type: 'alpha',
        config: {
          alpha: {
            list: [
              {
                time: 0,
                value: 0.8,
              },
              {
                time: 1,
                value: 0.1,
              },
            ],
          },
        },
      },
      {
        type: 'moveSpeed',
        config: {
          speed: {
            list: [
              {
                time: 0,
                value: 200,
              },
              {
                time: 1,
                value: 100,
              },
            ],
          },
        },
      },
      {
        type: 'scale',
        config: {
          scale: {
            list: [
              {
                time: 0,
                value: 1,
              },
              {
                time: 1,
                value: 0.3,
              },
            ],
          },
          minMult: 1,
        },
      },
      {
        type: 'color',
        config: {
          color: {
            list: [
              {
                time: 0,
                value: 'fb1010',
              },
              {
                time: 1,
                value: 'f5b830',
              },
            ],
          },
        },
      },
      {
        type: 'rotationStatic',
        config: {
          min: 0,
          max: 360,
        },
      },
      {
        type: 'textureRandom',
        config: {
          textures: ['particle.png'],
        },
      },
      {
        type: 'spawnShape',
        config: {
          type: 'torus',
          data: {
            x: 0,
            y: 0,
            radius: 10,
            innerRadius: 0,
            affectRotation: false,
          },
        },
      },
    ],
  };
}
