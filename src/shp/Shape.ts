import * as GeoJSON from 'geojson';
import { ShapeType } from '.';

export abstract class Shape {
  readonly position: number;

  abstract readonly type: ShapeType;

  constructor(position: number) {
    this.position = position;
  }

  abstract asGeoJson(): GeoJSON.Feature;
}
