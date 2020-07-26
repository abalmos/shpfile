import { Shape } from './Shape';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';

export class Point extends Shape {
  readonly type = 'Point';

  constructor(position: number) {
    super(position);

    /*
    if (dv.getUint32(0, true) !== ShapeCode.Point) {
      throw new Error('Not a Point shape.');
    }
    */
  }

  asGeoJson(): Feature<Geometry, GeoJsonProperties> {
    throw new Error('Method not implemented.');
  }
}
