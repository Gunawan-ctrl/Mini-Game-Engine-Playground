import type { Player, KeyboardState } from "../types/player";

export function handleMovement(
  player: Player,
  keyboard: KeyboardState,
): { x: number; y: number } {
  let newX = player.x;
  let newY = player.y;

  // Check for movement keys
  const up = keyboard.ArrowUp || keyboard.KeyW;
  const down = keyboard.ArrowDown || keyboard.KeyS;
  const left = keyboard.ArrowLeft || keyboard.KeyA;
  const right = keyboard.ArrowRight || keyboard.KeyD;

  // Calculate movement
  if (up) {
    newY -= player.speed;
  }
  if (down) {
    newY += player.speed;
  }
  if (left) {
    newX -= player.speed;
  }
  if (right) {
    newX += player.speed;
  }

  // Update direction based on horizontal movement
  if (left) {
    player.direction = "left";
  } else if (right) {
    player.direction = "right";
  }

  return { x: newX, y: newY };
}
