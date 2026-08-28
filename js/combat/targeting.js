import * as THREE from 'three';
export function raycastHit(raycaster, meshes){ const h=raycaster.intersectObjects(meshes); return h[0]||null }
