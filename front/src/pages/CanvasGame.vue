<template>
  <div class="w-screen h-screen relative keyb">
    <canvas
      @pointerdown="onPointerDown"
      ref="canvas"
      class="w-full h-full absolute"
    ></canvas>
    <input
      v-model="me.name"
      class="right-2 top-2 absolute bg-yellow-100 z-10"
      @input="onNameChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ShallowRef, computed, onUnmounted, reactive, ref, shallowRef } from 'vue';
import { useCanvasDPI, useAnimationFrames } from '../utils/rxjsUtils';
import { vec2 } from 'gl-matrix';

const { canvas, size, pixelSize } = useCanvasDPI();
const state: ShallowRef<BroadCastState['BroadCastState']> = shallowRef({
  state: {
    players: [],
  },
});

const myGhost = computed(() => {
  const val = state.value.state.players.find((player) => player.id === me.id);
  return val;
});

const me: PlayerState = reactive({
  name: '',
  position: [0, 0],
  id: -1,
});

const ws = new WebSocket('wss://professional-pamela-nelogica-4a911bbc.koyeb.app/ws');
ws.onmessage = onmessage;

onUnmounted(() => {
  ws.close();
});

function getMatrix() {
  const worldMatrix = new DOMMatrix();
  worldMatrix.scaleSelf(devicePixelRatio, devicePixelRatio);
  worldMatrix.translateSelf(size.width / 2, size.height / 2);
  return worldMatrix;
}

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !canvas.value) return;
  ctx.save();
  ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
  ctx.setTransform(getMatrix());
  state.value.state.players.forEach((player) => {
    const isMe = player.id === me.id;
    ctx.fillStyle = isMe ? '#49494962' : 'black';
    drawPlayer(ctx, player);
  });

  ctx.fillStyle = '#248124';
  drawPlayer(ctx, me);
  ctx.restore();
});

function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
  const SIZE = 10;
  ctx.fillText(player.name, player.position[0] - SIZE / 2, player.position[1] - SIZE);
  ctx.fillRect(player.position[0] - SIZE / 2, player.position[1] - SIZE / 2, SIZE, SIZE);
}

function onNameChange() {
  const setPlayerName: SetPlayerName = {
    SetPlayerName: { id: me.id, name: me.name },
  };
  ws.send(JSON.stringify(setPlayerName));
}

function onPointerDown(event: PointerEvent) {
  const pointClick = getMatrix()
    .inverse()
    .transformPoint({
      x: event.offsetX * devicePixelRatio,
      y: event.offsetY * devicePixelRatio,
    });
  const deltaX = pointClick.x - me.position[0];
  const deltaY = pointClick.y - me.position[1];
  const p = vec2.fromValues(deltaX, deltaY);
  vec2.normalize(p, p);
  vec2.scale(p, p, 20);
  const newPos = vec2.add(vec2.create(), me.position, p);
  me.position[0] = newPos[0];
  me.position[1] = newPos[1];
  const movePlayer: MovePlayer = {
    MovePlayer: { id: me.id, position: me.position },
  };
  ws.send(JSON.stringify(movePlayer));
}

function onmessage(event: MessageEvent) {
  const message: Messages = JSON.parse(event.data);
  if ('BroadCastState' in message) {
    state.value = message.BroadCastState;
    if (!me.name) {
      me.name = myGhost.value?.name ?? '';
    }
  }
  if ('PlayerCreatedResponse' in message) {
    me.id = message.PlayerCreatedResponse.id;
  }
}

interface PlayerState {
  name: string;
  position: [number, number];
  id: number;
}

type BroadCastState = {
  BroadCastState: {
    state: {
      players: PlayerState[];
    };
  };
};

type MovePlayer = {
  MovePlayer: {
    id: number;
    position: [number, number];
  };
};

type PlayerCreatedResponse = {
  PlayerCreatedResponse: {
    id: number;
  };
};

type SetPlayerName = {
  SetPlayerName: {
    id: number;
    name: string;
  };
};

type Messages = BroadCastState | MovePlayer | PlayerCreatedResponse | SetPlayerName;
</script>
