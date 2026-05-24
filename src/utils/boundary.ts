export function handleBoundary(
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
): { x: number; y: number } {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  let boundedX = x;
  let boundedY = y;

  // Horizontal boundaries
  if (x < 0) {
    boundedX = 0;
  } else if (x + scaledWidth > 800) {
    boundedX = 800 - scaledWidth;
  }

  // Vertical boundaries
  if (y < 0) {
    boundedY = 0;
  } else if (y + scaledHeight > 500) {
    boundedY = 500 - scaledHeight;
  }

  return { x: boundedX, y: boundedY };
}
