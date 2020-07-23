import { readFileSync } from 'fs';
import { Shapefile } from '../src/Shapefile';
import { Polygon } from '../src/shp/Polygon';
import polygonGeoJSON from './data/polygon.json';

test('Reading a polygon shapefile header', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  expect(s.bbox).toEqual({
    xmin: 0,
    xmax: 10.5,
    ymin: -1,
    ymax: 11.5,
    zmax: 0,
    zmin: 0,
  });
  expect(s.type).toEqual('Polygon');
});

test('Load and verify a single part polygon', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  const r = s.shape(0);

  if (r.type !== 'Polygon') {
    throw new Error('Not type Polygon');
  }

  expect(r.bbox).toEqual({
    xmin: 0,
    xmax: 10.5,
    ymin: 2,
    ymax: 11.5,
  });
  expect(r.type).toEqual('Polygon');
  expect(r.parts).toEqual([
    [
      [0, 11.5],
      [10.5, 11.5],
      [10.5, 2],
      [7, 8.5],
      [0, 11.5],
    ],
  ]);
});

test('Load and verify a multi-part polygon', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  const r = s.shape(1);

  if (r.type !== 'Polygon') {
    throw new Error('Excepted shape to be Polygon');
  }

  expect(r.bbox).toEqual({
    xmin: 0,
    xmax: 10.5,
    ymin: -1,
    ymax: 10.5,
  });
  expect(r.type).toEqual('Polygon');
  expect(r.parts).toEqual([
    [
      [0, 1],
      [0, 10.5],
      [10.5, -1],
      [0, 1],
    ],
    [
      [3.5, 5.3],
      [1.5, 4],
      [3.2, 1.8],
      [4.8, 3.2],
      [3.5, 5.3],
    ],
  ]);
});

test('Get all shapes from a Polygon', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  expect(s.shapes).toHaveLength(2);
  expect(s.shapes[0]).toBeInstanceOf(Polygon);
  expect(s.shapes[0].position).toEqual(1);
  expect(s.shapes[1]).toBeInstanceOf(Polygon);
  expect(s.shapes[1].position).toEqual(2);
});

test('Export polygon shapefile as GeoJSON', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer,
    new Uint8Array(readFileSync('tests/data/polygon.dbf')).buffer
  );

  const geoJson = s.asGeoJson();

  // Verify the string serialized version matches (the object has things
  // like Date in them)
  expect(JSON.parse(JSON.stringify(geoJson))).toEqual(polygonGeoJSON);
});

test('Get Polygon shapeRecord', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer,
    new Uint8Array(readFileSync('tests/data/polygon.dbf')).buffer
  );

  const sr = s.shapeRecord(0);

  const sh = sr.shape;
  const r = sr.record;

  if (sh.type !== 'Polygon') {
    throw new Error('Not type Polygon');
  }

  expect(sh.bbox).toEqual({
    xmin: 0,
    xmax: 10.5,
    ymin: 2,
    ymax: 11.5,
  });
  expect(sh.type).toEqual('Polygon');
  expect(sh.parts).toEqual([
    [
      [0, 11.5],
      [10.5, 11.5],
      [10.5, 2],
      [7, 8.5],
      [0, 11.5],
    ],
  ]);

  expect(r.position).toEqual(1);
  expect(r.isDeleted).toEqual(false);
  expect(r.properties.id).toEqual(123);
  expect(r.properties.string).toEqual('test');
  expect(r.properties.int).toEqual(456);
  expect(r.properties.float).toEqual(34.123);
  expect(r.properties.date).toEqual(new Date(2020, 6, 15));
});
