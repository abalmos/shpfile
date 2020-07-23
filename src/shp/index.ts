import { Point } from './Point';
import { Polygon } from './Polygon';

export interface BBoxXY {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface BBoxXYZ {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zmin: number;
  zmax: number;
}

export type Shapes = Point | Polygon;

// TODO: Can I remove this somehow? I sort of just want "Shapes" and let each shape
// type know its Shapefile numeric code
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
