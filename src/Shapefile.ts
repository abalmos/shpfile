import { ShapeType, BBoxXY, BBoxXYZ, Shapes } from './shp';

import * as GeoJSON from 'geojson';
import { DBF, Record, Field } from './dbf/DBF';
import { SHP } from './shp/SHP';
import { ShapeRecord } from './ShapeRecord';

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

  get bbox(): BBoxXY | BBoxXYZ {
    if (!this.shp) {
      throw new Error('No SHP file loaded');
    }

    return this.shp.bbox;
  }

  get type(): ShapeType {
    if (!this.shp) {
      throw new Error('No SHP file loaded');
    }

    return this.shp.typeName;
  }

  // NOTE: We index from 0, shapefiles index from 1
  shape(idx: number): Shapes {
    if (!this.shp) {
      throw new Error('No SHP file loaded');
    }

    return this.shp.shape(idx);
  }

  get shapes(): Shapes[] {
    if (!this.shp) {
      throw new Error('No SHP file loaded');
    }

    return this.shp.shapes();
  }

  get fields(): Field[] {
    if (!this.dbf) {
      throw new Error('No DBF file loaded');
    }

    return this.dbf.fields;
  }

  record(idx: number): Record {
    if (!this.dbf) {
      throw new Error('No DBF file loaded');
    }

    return this.dbf.record(idx);
  }

  get records(): Record[] {
    if (!this.dbf) {
      throw new Error('No DBF file loaded');
    }

    return this.dbf.records();
  }

  shapeRecord(idx: number): ShapeRecord {
    const shape = this.shape(idx);
    const record = this.record(idx);

    return new ShapeRecord(shape, record);
  }

  get shapeRecords(): ShapeRecord[] {
    const shapes = this.shapes;
    const records = this.records;

    const shapeRecords = new Array(shapes.length);
    for (let i = 0; i < shapes.length; i++) {
      shapeRecords[i] = new ShapeRecord(shapes[i], records[i]);
    }

    return shapeRecords;
  }

  asGeoJson(): GeoJSON.FeatureCollection {
    if (!this.shp) {
      throw new Error('No SHP file loaded');
    }

    const geoJson = this.shp.asGeoJson();

    if (this.dbf) {
      geoJson.features = geoJson.features.map((feature, i) => {
        const record = this.record(i);

        feature.properties = record.properties;

        return feature;
      });
    }

    return geoJson;
  }
}
