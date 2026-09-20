import * as THREE from 'three';

export interface MeshDimensionsMM {
  x: number;
  y: number;
  z: number;
}

export interface MeshAnalysis {
  triangleCount: number;
  boundaryEdgeCount: number;
  /** No open (non-manifold) edges — required for a valid, sliceable print. */
  watertight: boolean;
  dimensionsMM: MeshDimensionsMM;
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

/**
 * A mesh is watertight when every edge is shared by exactly two triangles.
 * An edge used by only one triangle is a boundary (hole) edge.
 */
export function analyzeGeometry(geometry: THREE.BufferGeometry): MeshAnalysis {
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();

  const triangleCount = index ? index.count / 3 : position.count / 3;
  const edgeUsage = new Map<string, number>();

  const readVertex = (i: number) => (index ? index.getX(i) : i);

  for (let t = 0; t < triangleCount; t++) {
    const a = readVertex(t * 3);
    const b = readVertex(t * 3 + 1);
    const c = readVertex(t * 3 + 2);
    for (const [v1, v2] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const key = edgeKey(v1, v2);
      edgeUsage.set(key, (edgeUsage.get(key) ?? 0) + 1);
    }
  }

  let boundaryEdgeCount = 0;
  for (const count of edgeUsage.values()) {
    if (count !== 2) boundaryEdgeCount++;
  }

  geometry.computeBoundingBox();
  const box = geometry.boundingBox ?? new THREE.Box3();
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    triangleCount,
    boundaryEdgeCount,
    watertight: boundaryEdgeCount === 0 && triangleCount > 0,
    dimensionsMM: { x: size.x, y: size.y, z: size.z },
  };
}

/**
 * Merges vertices closer than `tolerance` and drops degenerate (zero-area)
 * triangles. This closes the small gaps/duplicate seams that are the most
 * common cause of a non-watertight export from parametric or CAD sources.
 */
export function repairGeometry(
  geometry: THREE.BufferGeometry,
  tolerance = 1e-5
): THREE.BufferGeometry {
  const merged = mergeVertices(geometry, tolerance);
  return dropDegenerateTriangles(merged);
}

function mergeVertices(geometry: THREE.BufferGeometry, tolerance: number): THREE.BufferGeometry {
  const position = geometry.getAttribute('position');
  const precision = Math.max(0, Math.round(-Math.log10(tolerance)));
  const keyToIndex = new Map<string, number>();
  const newPositions: number[] = [];
  const remap = new Int32Array(position.count);

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const key = `${x.toFixed(precision)}_${y.toFixed(precision)}_${z.toFixed(precision)}`;
    let index = keyToIndex.get(key);
    if (index === undefined) {
      index = newPositions.length / 3;
      keyToIndex.set(key, index);
      newPositions.push(x, y, z);
    }
    remap[i] = index;
  }

  const sourceIndex = geometry.getIndex();
  const newIndex: number[] = [];
  if (sourceIndex) {
    for (let i = 0; i < sourceIndex.count; i++) {
      newIndex.push(remap[sourceIndex.getX(i)]);
    }
  } else {
    for (let i = 0; i < position.count; i++) {
      newIndex.push(remap[i]);
    }
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  result.setIndex(newIndex);
  return result;
}

function dropDegenerateTriangles(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!index) return geometry;

  const kept: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let t = 0; t < index.count / 3; t++) {
    const ia = index.getX(t * 3);
    const ib = index.getX(t * 3 + 1);
    const ic = index.getX(t * 3 + 2);
    if (ia === ib || ib === ic || ic === ia) continue;

    a.fromBufferAttribute(position, ia);
    b.fromBufferAttribute(position, ib);
    c.fromBufferAttribute(position, ic);
    const area = new THREE.Triangle(a, b, c).getArea();
    if (area <= 1e-12) continue;

    kept.push(ia, ib, ic);
  }

  geometry.setIndex(kept);
  return geometry;
}
