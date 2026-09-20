import React from 'react';
import type * as THREE from 'three';
import { exportSTL, exportOBJ, exportGLB, export3MF, type ExportedFile } from '../../three/exporters';

export type ModelExportFormat = 'stl' | 'obj' | 'glb' | '3mf';

export interface ModelExportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The mesh/group to export. */
  object: THREE.Object3D;
  /** Used to name downloaded files, e.g. "widget-bracket" -> widget-bracket_print-ready.3mf. */
  projectName: string;
  /** Base material color applied to the 3MF export. */
  colorHex?: string;
  /** Restrict which format buttons are shown; defaults to all four. */
  formats?: ModelExportFormat[];
  /** Called after a format has been exported, with the resulting file. */
  onExported?: (format: ModelExportFormat, file: ExportedFile) => void;
  /** Called if an export fails. */
  onError?: (format: ModelExportFormat, error: unknown) => void;
}

const FORMAT_LABELS: Record<ModelExportFormat, string> = {
  stl: 'STL',
  obj: 'OBJ',
  glb: 'GLB',
  '3mf': '3MF (Bambu Studio)',
};

function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export panel for a three.js model: STL/OBJ/GLB for general mesh workflows,
 * plus a print-ready 3MF (millimetres, repaired watertight mesh, and
 * recommended print settings/printability notes) for Bambu Studio.
 */
export function ModelExport({
  object,
  projectName,
  colorHex,
  formats = ['stl', 'obj', 'glb', '3mf'],
  onExported,
  onError,
  className,
  ...rest
}: ModelExportProps) {
  const [pending, setPending] = React.useState<ModelExportFormat | null>(null);

  async function handleExport(format: ModelExportFormat) {
    setPending(format);
    try {
      let file: ExportedFile;
      switch (format) {
        case 'stl':
          file = exportSTL(object, projectName);
          break;
        case 'obj':
          file = exportOBJ(object, projectName);
          break;
        case 'glb':
          file = await exportGLB(object, projectName);
          break;
        case '3mf':
          file = await export3MF(object, { projectName, colorHex });
          break;
      }
      downloadBlob(file.fileName, file.blob);
      onExported?.(format, file);
    } catch (error) {
      onError?.(format, error);
    } finally {
      setPending(null);
    }
  }

  const classes = ['ds-model-export', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {formats.map((format) => (
        <button
          key={format}
          type="button"
          className="ds-button ds-button--secondary ds-button--md"
          disabled={pending !== null}
          onClick={() => handleExport(format)}
        >
          {pending === format ? 'Exporting…' : `Export ${FORMAT_LABELS[format]}`}
        </button>
      ))}
    </div>
  );
}
