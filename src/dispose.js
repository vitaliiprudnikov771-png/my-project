export function disposeObjectResources(root) {
  if (!root || typeof root.traverse !== "function") return;

  const geometries = new Set();
  const materials = new Set();

  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);

    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of objectMaterials) {
      if (material) materials.add(material);
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
