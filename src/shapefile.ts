// TODO: Move to just ./shapes/index.ts' ?
import { Shape } from './shp/Shape';
import { Polygon } from './shp/Polygon';

import * as GeoJSON from 'geojson';
import { DBF, Record, Field } from './dbf/DBF';
import { SHP } from './shp/SHP';

// TODO: We need a "shapefile" class which processes .shp files
//       This class is a mix of that and an easy to use warpper that
//       deals with the various files of a shapefile
export class Shapefile {
  private shp: SHP | undefined;
  private dbf: DBF | undefined;

  // TODO: detect file type from binary itself
  constructor(shp: ArrayBuffer, dbf?: ArrayBuffer) {
    if (shp) {
      this.shp = new SHP(shp);
    }

    if (dbf) {
      this.dbf = new DBF(dbf);
    }
  }

  // NOTE: We index from 0, shapefiles index from 1
  shape(idx: number): Polygon | undefined {
    if (!this.shp) {
      return undefined;
    }

    return this.shp.shape(idx);
  }

  shapes(): Shape[] | undefined {
    if (!this.shp) {
      return undefined;
    }

    return this.shp.shapes();
  }

  fields(): Field[] | undefined {
    if (!this.dbf) {
      return undefined;
    }

    return this.dbf.fields;
  }

  record(idx: number): Record | undefined {
    if (!this.dbf) {
      return undefined;
    }

    return this.dbf.record(idx);
  }

  records(): Record[] | undefined {
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
    throw new Error('not implemented');
  }
}
