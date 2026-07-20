function clampBounds(bounds, size, workArea) {
  const width = Math.min(size.width, workArea.width);
  const height = Math.min(size.height, workArea.height);
  const maxX = workArea.x + workArea.width - width;
  const maxY = workArea.y + workArea.height - height;

  return {
    x: Math.max(workArea.x, Math.min(bounds.x, maxX)),
    y: Math.max(workArea.y, Math.min(bounds.y, maxY)),
    width,
    height,
  };
}

function calculateModeBounds(bounds, size, workArea) {
  const rightEdge = bounds.x + bounds.width;
  return clampBounds(
    {
      x: rightEdge - size.width,
      y: bounds.y,
      width: size.width,
      height: size.height,
    },
    size,
    workArea,
  );
}

module.exports = { clampBounds, calculateModeBounds };
