import * as THREE from 'three';
import type { MeshAnalysis } from './meshAnalysis';

export interface PrintOrientation {
  /** Rotation applied to lay the model in its recommended build orientation, in degrees. */
  rotationDegrees: { x: number; y: number; z: number };
  note: string;
}

export interface PrintRecommendations {
  layerHeightMM: number;
  wallCount: number;
  infillPercent: number;
  supportsRequired: boolean;
  supportsNote: string;
  orientation: PrintOrientation;
}

/**
 * Heuristic print-settings recommendation, not a slicer. Flags a tall,
 * slender model as support-likely and favours a flat base orientation —
 * good defaults for Bambu Studio to refine, not a substitute for it.
 */
export function recommendPrintSettings(analysis: MeshAnalysis): PrintRecommendations {
  const { x, y, z } = analysis.dimensionsMM;
  const footprint = Math.min(x, y);
  const height = z;
  const isTallAndSlender = height > footprint * 2 && footprint > 0;

  const layerHeightMM = height > 0 && height < 20 ? 0.12 : 0.2;
  const wallCount = footprint < 10 ? 2 : 3;
  const infillPercent = height > footprint * 3 ? 20 : 15;

  return {
    layerHeightMM,
    wallCount,
    infillPercent,
    supportsRequired: isTallAndSlender || !analysis.watertight,
    supportsNote: isTallAndSlender
      ? 'Tall, narrow geometry relative to its footprint — enable tree or normal supports for overhangs.'
      : 'No significant overhangs detected from bounding geometry; supports likely unnecessary, but confirm in slicer preview.',
    orientation: {
      rotationDegrees: { x: 0, y: 0, z: 0 },
      note:
        'Model exported in its authored orientation with the largest flat face assumed down. Re-orient in Bambu Studio if the authored "up" axis does not match the intended build plate normal.',
    },
  };
}

export function buildOrientationMatrix(orientation: PrintOrientation): THREE.Matrix4 {
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(orientation.rotationDegrees.x),
    THREE.MathUtils.degToRad(orientation.rotationDegrees.y),
    THREE.MathUtils.degToRad(orientation.rotationDegrees.z)
  );
  return new THREE.Matrix4().makeRotationFromEuler(euler);
}
