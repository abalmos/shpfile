// TODO: Move to just ./shapes/index.ts' ?
import { Shape, CodeShape } from './shapes/Shape';
import { Polygon } from './shapes/Polygon';

import * as GeoJSON from 'geojson';
import { XBase, XBaseRecord } from './XBase/XBase';

// TODO: We need a "shapefile" class which processes .shp files
//       This class is a mix of that and an easy to use warpper that
//       deals with the various files of a shapefile
export class Shapefile {
  private shp: DataView;
  private dbf: XBase | undefined;

  readonly type: number;
  readonly typeName: string;
  readonly fileLen: number;

  readonly xmin: number;
  readonly xmax: number;
  readonly ymin: number;
  readonly ymax: number;
  readonly zmin: number;
  readonly zmax: number;
  readonly mmin: number;
  readonly mmax: number;

  constructor(shp: ArrayBuffer, dbf?: ArrayBuffer) {
    if (dbf) {
      this.dbf = new XBase(dbf);
    }

    this.shp = new DataView(shp);

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

    this.xmin = this.shp.getFloat64(36, true);
    this.xmax = this.shp.getFloat64(52, true);
    this.ymin = this.shp.getFloat64(44, true);
    this.ymax = this.shp.getFloat64(60, true);
    this.zmin = this.shp.getFloat64(68, true);
    this.zmax = this.shp.getFloat64(76, true);
    this.mmin = this.shp.getFloat64(84, true);
    this.mmax = this.shp.getFloat64(92, true);
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

  // TODO: What does this return?
  fields(): unknown {
    if (!this.dbf) {
      return undefined;
    }

    return this.dbf.fields;
  }

  record(idx: number): XBaseRecord | undefined {
    if (!this.dbf) {
      return undefined;
    }

    return this.dbf.record(idx);
  }

  records(): XBaseRecord[] | undefined {
    if (!this.dbf) {
      return undefined;
    }

    return this.dbf.records();
  }

  // TODO: We need a real type here...
  shapeRecord(idx: number): unknown {
    const shape = this.shape(idx);
    const record = this.record(idx);

    return {
      shape,
      record,
      position: shape?.position,
    };
  }

  shapeRecords(): unknown[] {
    throw new Error(`not implemented`);
  }

  asJson(): GeoJSON.FeatureCollection {
    const shapes = this.shapes();
    const features = shapes.map((shape) => shape.asJson());

    // TODO: If we have a 'dbf', get the properties too

    return {
      type: 'FeatureCollection',
      bbox: [this.xmin, this.ymin, this.xmax, this.ymax],
      features,
    };
  }

  /*
  getRecords(): PolygonShape {
    // Use the index to determine the offset
    const offset = 100;

    // let num = this.shp.getUint32(offset);
    const length = this.shp.getUint32(offset + 4);

    return PolygonShape.from(
      this.shp.buffer.slice(offset + 8, offset + 8 + 2 * length)
    );
    //while (offset < this.length) {
    //}
  }
  */
}
