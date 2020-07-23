import { Shape, ShapeCode } from './Shape';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';

export class Point extends Shape {
  readonly type = 'Point';

  private dv: DataView;

  constructor(position: number, dv: DataView) {
    super(position);

    if (dv.getUint32(0, true) !== ShapeCode.Point) {
      throw new Error('Not a Point shape.');
    }

    this.dv = dv;
  }

  asGeoJson(): Feature<Geometry, GeoJsonProperties> {
    throw new Error('Method not implemented.');
  }
}
