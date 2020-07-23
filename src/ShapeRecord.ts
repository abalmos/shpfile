import { Shapes } from './shp';
import { Record } from './dbf/DBF';

export class ShapeRecord {
  shape: Shapes;
  record?: Record | undefined;
  position: number;
  isDeleted?: boolean;

  constructor(shape: Shapes, record?: Record) {
    this.shape = shape;
    this.record = record;
    this.position = shape.position;
    this.isDeleted = record?.isDeleted;
  }

  asGeoJson(): GeoJSON.Feature {
    const json = this.shape.asGeoJson();

    if (this.record) {
      json.properties = this.record.properties;
    }

    return json;
  }
}
