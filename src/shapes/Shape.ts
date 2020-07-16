import * as GeoJSON from 'geojson';

export type ShapeType =
  | 'Null'
  | 'Point'
  | 'PolyLine'
  | 'Polygon'
  | 'MultiPoint'
  | 'PointZ'
  | 'PolyLineZ'
  | 'PolygonZ'
  | 'MultiPointZ'
  | 'PointM'
  | 'PolyLineM'
  | 'PolygonM'
  | 'MultiPointM'
  | 'MultiPatch';

export const ShapeCode: { [key in ShapeType]: number } = {
  Null: 0,
  Point: 1,
  PolyLine: 3,
  Polygon: 5,
  MultiPoint: 8,
  PointZ: 11,
  PolyLineZ: 13,
  PolygonZ: 15,
  MultiPointZ: 18,
  PointM: 21,
  PolyLineM: 23,
  PolygonM: 25,
  MultiPointM: 28,
  MultiPatch: 31,
};

export const CodeShape: { [key: number]: keyof typeof ShapeCode } = {
  0: 'Null',
  1: 'Point',
  3: 'PolyLine',
  5: 'Polygon',
  8: 'MultiPoint',
  11: 'PointZ',
  13: 'PolyLineZ',
  15: 'PolygonZ',
  18: 'MultiPointZ',
  21: 'PointM',
  23: 'PolyLineM',
  25: 'PolygonM',
  28: 'MultiPointM',
  31: 'MultiPatch',
};

export abstract class Shape {
  readonly position: number;

  abstract readonly type: ShapeType;

  constructor(position: number) {
    this.position = position;
  }

  abstract asJson(): GeoJSON.Feature;
}
