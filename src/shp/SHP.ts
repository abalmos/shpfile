// TODO: Move to just ./shapes/index.ts' ?
import { Shape, CodeShape } from './Shape';
import { Polygon } from './Polygon';

import * as GeoJSON from 'geojson';

interface BBox {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zmin: number;
  zmax: number;
  mmin: number;
  mmax: number;
}

export class SHP {
  private shp: DataView;

  readonly type: number;
  readonly typeName: string;
  readonly fileLen: number;

  readonly bbox: BBox;

  constructor(buf: ArrayBuffer) {
    this.shp = new DataView(buf);

    if (this.shp.getUint32(0) !== 9994) {
      throw new Error('Missing Shapefile magic number');
    }

    if (this.shp.getUint32(28, true) !== 1000) {
      throw new Error('Unexpected version number');
    }

    this.fileLen = this.shp.getUint32(24) * 2;
    if (this.shp.byteLength < this.fileLen) {
      throw new Error('File buffer shorter then expected.');
    }

    this.type = this.shp.getUint32(32, true);
    this.typeName = CodeShape[this.type];
    if (!this.typeName) {
      throw new Error(`Unknown shape type: ${this.type}.`);
    }

    this.bbox = {
      xmin: this.shp.getFloat64(36, true),
      xmax: this.shp.getFloat64(52, true),
      ymin: this.shp.getFloat64(44, true),
      ymax: this.shp.getFloat64(60, true),
      zmin: this.shp.getFloat64(68, true),
      zmax: this.shp.getFloat64(76, true),
      mmin: this.shp.getFloat64(84, true),
      mmax: this.shp.getFloat64(92, true),
    };
  }

  // NOTE: We index from 0, shapefiles index from 1
  shape(idx: number): Polygon | undefined {
    if (idx < 0) {
      throw new Error('Request shape index out of bounds');
    }

    // TODO: Check SHX first
    let offset = 100;
    for (let i = 0; i < idx && offset < this.fileLen - 100; i++) {
      // 8 skips record number + length
      // 2 * length because shape lengths are in words
      offset += 8 + 2 * this.shp.getUint32(offset + 4);
    }

    // File does not have this shape idx
    if (offset >= this.fileLen) {
      return;
    }

    const p = this.shp.getUint32(offset);
    const dv = new DataView(
      this.shp.buffer,
      offset + 8, // Start of shape
      2 * this.shp.getUint32(offset + 4) // Shape length
    );

    return new Polygon(p, dv);
  }

  // TODO: Would it be better to just run down the file directly here?
  shapes(): Shape[] {
    const shapes: Shape[] = [];
    let shape;
    while ((shape = this.shape(shapes.length))) {
      shapes.push(shape);
    }

    return shapes;
  }

  asJson(): GeoJSON.FeatureCollection {
    // Convert each shape into a GeoJSON
    const features = this.shapes().map((s) => s.asJson());

    // Convert to GeoJSON bbox array
    let bbox: GeoJSON.BBox;
    if (this.typeName.match(/[Z|M]$/)) {
      bbox = [
        this.bbox.xmin,
        this.bbox.ymin,
        this.bbox.zmin,
        this.bbox.xmax,
        this.bbox.ymax,
        this.bbox.zmax,
      ];
    } else {
      bbox = [this.bbox.xmin, this.bbox.ymin, this.bbox.xmax, this.bbox.ymax];
    }

    return {
      type: 'FeatureCollection',
      bbox,
      features,
    };
  }
}
