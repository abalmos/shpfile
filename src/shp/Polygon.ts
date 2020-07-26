import * as GeoJSON from 'geojson';
import { ShapeCode } from '.';
import { Shape } from './Shape';
import { BBoxXY } from '.';

export class Polygon extends Shape {
  readonly type = 'Polygon';

  readonly bbox: Readonly<BBoxXY>;
  readonly polygons: [number, number][][][];

  constructor(position: number, dv: DataView) {
    super(position);

    if (dv.getUint32(0, true) !== ShapeCode.Polygon) {
      throw new Error('Not a Polygon shape!');
    }

    this.bbox = {
      xmin: dv.getFloat64(4, true),
      ymin: dv.getFloat64(12, true),
      xmax: dv.getFloat64(20, true),
      ymax: dv.getFloat64(28, true),
    };

    // Fetch shape parts
    const numParts = dv.getUint32(36, true);
    const partOffset = 44;
    const parts = new Array(numParts);
    for (let i = 0; i < numParts; i++) {
      parts[i] = dv.getUint32(partOffset + 4 * i, true);
    }

    // Fetch shape points
    let polygon: Array<[number, number][]> = [];
    const numPoints = dv.getUint32(40, true);
    const pointsOffset = partOffset + 4 * numParts;
    this.polygons = [];

    // Read the points, part by part
    for (let part = 0; part < numParts; part++) {
      const start = parts[part];
      const stop = parts[part + 1] || numPoints;
      const partLen = stop - start;

      const points: [number, number][] = new Array(partLen);
      for (let i = 0; i < partLen; i++) {
        const offset = pointsOffset + 8 * 2 * (i + start);
        points[i] = [
          dv.getFloat64(offset, true),
          dv.getFloat64(offset + 8, true),
        ];
      }

      if (this.signedArea(points) < 0 && polygon.length) {
        this.polygons.push(polygon);
        polygon = [];
      }

      polygon.push(points);
    }
    this.polygons.push(polygon);
  }

  private signedArea(part: number[][]): number {
    let sum = 0;
    // TODO: starging at 1 and going length - 1 is wrong
    for (let i = 0; i < part.length - 1; i++) {
      sum += part[i][0] * part[i + 1][1] - part[i + 1][0] * part[i][1];
      // sum += part[i][0] + (part[i + 1][1] - part[i - 1][1]);
    }

    return sum / 2;
  }

  asGeoJson(): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
    if (this.polygons.length > 1) {
      return {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          bbox: [
            this.bbox.xmin,
            this.bbox.ymin,
            this.bbox.xmax,
            this.bbox.ymax,
          ],
          coordinates: this.polygons,
        },
        properties: {},
      };
    } else {
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          bbox: [
            this.bbox.xmin,
            this.bbox.ymin,
            this.bbox.xmax,
            this.bbox.ymax,
          ],
          coordinates: this.polygons[0],
        },
        properties: {},
      };
    }
  }
}
