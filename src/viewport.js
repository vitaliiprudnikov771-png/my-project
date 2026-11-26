export function getViewportMetrics(view, maxPixelRatio = 1.5) {
  const visualViewport = view?.visualViewport;
  const width = Math.max(1, Math.round(
    visualViewport?.width || view?.innerWidth || 1
  ));
  const height = Math.max(1, Math.round(
    visualViewport?.height || view?.innerHeight || 1
  ));

  const devicePixelRatio = Number(view?.devicePixelRatio);
  const pixelRatio = Number.isFinite(devicePixelRatio)
    ? devicePixelRatio
    : 1;
  const cap = Number.isFinite(maxPixelRatio)
    ? Math.max(1, maxPixelRatio)
    : 1.5;

  return {
    width,
    height,
    pixelRatio: Math.min(Math.max(1, pixelRatio), cap)
  };
}
