import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import JSZip from 'jszip';
import { analyzeGeometry, repairGeometry } from './meshAnalysis';
import { recommendPrintSettings, type PrintRecommendations } from './printRecommendations';

export interface ExportedFile {
  fileName: string;
  blob: Blob;
}

export interface ThreeMFOptions {
  projectName: string;
  /** Hex color, e.g. "#1F2120", applied as the single base material. */
  colorHex?: string;
}

function toFileSafeName(projectName: string): string {
  return projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'model';
}

export function exportSTL(object: THREE.Object3D, projectName: string): ExportedFile {
  const exporter = new STLExporter();
  const result = exporter.parse(object, { binary: true }) as unknown as DataView;
  const blob = new Blob([result.buffer as ArrayBuffer], { type: 'model/stl' });
  return { fileName: `${toFileSafeName(projectName)}.stl`, blob };
}

export function exportOBJ(object: THREE.Object3D, projectName: string): ExportedFile {
  const exporter = new OBJExporter();
  const result = exporter.parse(object);
  const blob = new Blob([result], { type: 'text/plain' });
  return { fileName: `${toFileSafeName(projectName)}.obj`, blob };
}

export function exportGLB(object: THREE.Object3D, projectName: string): Promise<ExportedFile> {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        const buffer = result as ArrayBuffer;
        const blob = new Blob([buffer], { type: 'model/gltf-binary' });
        resolve({ fileName: `${toFileSafeName(projectName)}.glb`, blob });
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

function collectTriangleMeshes(object: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  object.updateWorldMatrix(true, true);
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

const THREEMF_NAMESPACE = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;
const RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

function escapeXML(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Builds a print-ready Bambu Studio (core-spec) 3MF: millimetre units, a
 * repaired watertight mesh, and recommended print settings/printability
 * notes carried as <metadata> on the model so they survive round-trips
 * even though Bambu Studio's own project settings live outside core 3MF.
 */
export async function export3MF(
  object: THREE.Object3D,
  options: ThreeMFOptions
): Promise<ExportedFile & { analysis: ReturnType<typeof analyzeGeometry>; recommendations: PrintRecommendations }> {
  const meshes = collectTriangleMeshes(object);
  if (meshes.length === 0) {
    throw new Error('export3MF: no mesh geometry found in the provided object.');
  }

  const zip = new JSZip();
  const resourceObjects: string[] = [];
  const buildItems: string[] = [];
  let combinedAnalysis = { triangleCount: 0, boundaryEdgeCount: 0, watertight: true, dimensionsMM: { x: 0, y: 0, z: 0 } };
  const overallBox = new THREE.Box3();

  meshes.forEach((mesh, meshIndex) => {
    const worldGeometry = mesh.geometry.clone();
    worldGeometry.applyMatrix4(mesh.matrixWorld);
    const repaired = repairGeometry(worldGeometry);
    const analysis = analyzeGeometry(repaired);
    combinedAnalysis = {
      triangleCount: combinedAnalysis.triangleCount + analysis.triangleCount,
      boundaryEdgeCount: combinedAnalysis.boundaryEdgeCount + analysis.boundaryEdgeCount,
      watertight: combinedAnalysis.watertight && analysis.watertight,
      dimensionsMM: analysis.dimensionsMM,
    };
    repaired.computeBoundingBox();
    if (repaired.boundingBox) overallBox.union(repaired.boundingBox);

    const position = repaired.getAttribute('position');
    const index = repaired.getIndex();
    const objectId = meshIndex + 1;

    const vertices: string[] = [];
    for (let i = 0; i < position.count; i++) {
      vertices.push(
        `<vertex x="${position.getX(i)}" y="${position.getY(i)}" z="${position.getZ(i)}"/>`
      );
    }

    const triangles: string[] = [];
    const triCount = index ? index.count / 3 : position.count / 3;
    for (let t = 0; t < triCount; t++) {
      const a = index ? index.getX(t * 3) : t * 3;
      const b = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const c = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      triangles.push(`<triangle v1="${a}" v2="${b}" v3="${c}"/>`);
    }

    resourceObjects.push(
      `<object id="${objectId}" type="model" name="${escapeXML(mesh.name || options.projectName)}"><mesh><vertices>${vertices.join('')}</vertices><triangles>${triangles.join('')}</triangles></mesh></object>`
    );
    buildItems.push(`<item objectid="${objectId}"/>`);
  });

  const recommendations = recommendPrintSettings(combinedAnalysis);
  const size = new THREE.Vector3();
  overallBox.getSize(size);
  combinedAnalysis.dimensionsMM = { x: size.x, y: size.y, z: size.z };

  const materialsBlock = options.colorHex
    ? `<basematerials id="${resourceObjects.length + 1}"><base name="${escapeXML(options.projectName)}" displaycolor="${options.colorHex.toUpperCase()}FF"/></basematerials>`
    : '';

  const metadata = [
    ['Title', options.projectName],
    ['Application', '435 Design System 3D Export'],
    ['PrintUnits', 'millimeter'],
    ['ModelDimensionsMM', `${combinedAnalysis.dimensionsMM.x.toFixed(2)} x ${combinedAnalysis.dimensionsMM.y.toFixed(2)} x ${combinedAnalysis.dimensionsMM.z.toFixed(2)}`],
    ['Watertight', String(combinedAnalysis.watertight)],
    ['TriangleCount', String(combinedAnalysis.triangleCount)],
    ['RecommendedLayerHeightMM', String(recommendations.layerHeightMM)],
    ['RecommendedWallCount', String(recommendations.wallCount)],
    ['RecommendedInfillPercent', String(recommendations.infillPercent)],
    ['SupportsRequired', String(recommendations.supportsRequired)],
    ['SupportsNote', recommendations.supportsNote],
    ['PrintOrientationNote', recommendations.orientation.note],
    [
      'PrintabilityNote',
      combinedAnalysis.watertight
        ? 'Mesh is watertight (manifold) and safe to slice directly.'
        : `Mesh has ${combinedAnalysis.boundaryEdgeCount} open boundary edge(s) after repair; inspect for holes before printing.`,
    ],
  ]
    .map(([name, value]) => `<metadata name="${escapeXML(name)}">${escapeXML(value)}</metadata>`)
    .join('');

  const modelXML = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="${THREEMF_NAMESPACE}">
  ${metadata}
  <resources>${materialsBlock}${resourceObjects.join('')}</resources>
  <build>${buildItems.join('')}</build>
</model>`;

  zip.file('[Content_Types].xml', CONTENT_TYPES);
  zip.file('_rels/.rels', RELS);
  zip.file('3D/3dmodel.model', modelXML);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'model/3mf' });
  return {
    fileName: `${toFileSafeName(options.projectName)}_print-ready.3mf`,
    blob,
    analysis: combinedAnalysis,
    recommendations,
  };
}
