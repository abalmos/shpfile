import * as GeoJSON from 'geojson';
import { Shape, ShapeType, ShapeCode } from './Shape';

export class Polygon extends Shape {
  type: ShapeType;
  position: number;

  readonly xmin: number;
  readonly xmax: number;
  readonly ymin: number;
  readonly ymax: number;
  readonly parts: [number, number][][];

  constructor(position: number, dv: DataView) {
    super(position);

    if (dv.getUint32(0, true) !== ShapeCode.Polygon) {
      throw new Error('Not a Polygon shape!');
    }

    this.type = 'Polygon';
    this.position = position;

    this.xmin = dv.getFloat64(4, true);
    this.ymin = dv.getFloat64(12, true);
    this.xmax = dv.getFloat64(20, true);
    this.ymax = dv.getFloat64(28, true);

    // Fetch shape parts
    const numParts = dv.getUint32(36, true);
    const partOffset = 44;
    const parts = new Array(numParts);
    for (let i = 0; i < numParts; i++) {
      parts[i] = dv.getUint32(partOffset + 4 * i, true);
    }

    // Fetch shape points
    const numPoints = dv.getUint32(40, true);
    const pointsOffset = partOffset + 4 * numParts;
    this.parts = new Array(numParts);

    // Read the points, part by part
    for (let part = 0; part < numParts; part++) {
      const start = parts[part];
      const stop = parts[part + 1] || numPoints;
      const partLen = stop - start;

      const points = new Array(partLen);
      for (let i = 0; i < partLen; i++) {
        const offset = pointsOffset + 8 * 2 * (i + start);
        points[i] = [
          dv.getFloat64(offset, true),
          dv.getFloat64(offset + 8, true),
        ];
      }

      this.parts[part] = points;
    }
  }

  asJson(): GeoJSON.Feature<GeoJSON.Polygon> {
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        bbox: [this.xmin, this.ymin, this.xmax, this.ymax],
        coordinates: this.parts,
      },
      properties: {},
    };
  }
}
