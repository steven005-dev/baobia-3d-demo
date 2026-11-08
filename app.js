import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("scene-container");
const selectedElementLabel = document.getElementById("selected-element");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(4, 3, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.75, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 8);
scene.add(directionalLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x0b3d2e, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.2;
scene.add(ground);

const elements = [
  {
    name: "Zone d'élevage",
    description: "Espace principal simulant un élevage suivi par BAOBIA.",
    mesh: new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 2),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5 })
    ),
  },
  {
    name: "Centre de données",
    description: "Nœud de collecte et de consolidation des informations.",
    mesh: new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9 })
    ),
  },
  {
    name: "Flux de suivi sanitaire",
    description: "Canal de visualisation des indicateurs de santé.",
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0x22c55e })
    ),
  },
];

elements[0].mesh.position.set(-2.5, 0.4, 0);
elements[1].mesh.position.set(0, 0.55, 0);
elements[2].mesh.position.set(2.5, 0.65, 0);

elements.forEach((element) => {
  element.mesh.userData = {
    ...element,
    originalColor: element.mesh.material.color.getHex(),
  };
  scene.add(element.mesh);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function resetHighlights() {
  elements.forEach(({ mesh }) => {
    mesh.material.color.setHex(mesh.userData.originalColor);
  });
}

function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(elements.map((item) => item.mesh));

  resetHighlights();

  if (!intersects.length) {
    selectedElementLabel.textContent = "Aucun élément sélectionné.";
    return;
  }

  const selected = intersects[0].object;
  selected.material.color.setHex(0xf59e0b);
  selectedElementLabel.textContent = `${selected.userData.name} — ${selected.userData.description}`;
}

renderer.domElement.addEventListener("pointerdown", onPointerClick);

function onResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) {
    return;
  }
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", onResize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
