export function rotateLeft(currentRotation: number): number {
  return currentRotation - 5;
}

export function rotateRight(currentRotation: number): number {
  return currentRotation + 5;
}

export function scaleUp(currentScale: number): number {
  const newScale = currentScale + 0.05;
  return Math.min(newScale, 2);
}

export function scaleDown(currentScale: number): number {
  const newScale = currentScale - 0.05;
  return Math.max(newScale, 0.5);
}
