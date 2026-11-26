export function configureSimpleRender(scene, renderer, THREE) {
  scene.background = new THREE.Color(0x333333);
  scene.fog = null;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(-8, 10, 4);

  scene.add(ambientLight);
  scene.add(directionalLight);

  return { ambientLight, directionalLight };
};
