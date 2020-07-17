import { readFileSync } from 'fs';
import { Shapefile } from '../src/shapefile';
import { Polygon } from '../src/shp/Polygon';
import polygonGeoJSON from './data/polygon.json';

test('Reading a polygon shapefile header', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  expect(s.xmin).toEqual(0);
  expect(s.xmax).toEqual(10.5);
  expect(s.ymin).toEqual(-1);
  expect(s.ymax).toEqual(11.5);
  expect(s.zmax).toEqual(0);
  expect(s.zmin).toEqual(0);
  expect(s.mmax).toEqual(0);
  expect(s.mmin).toEqual(0);
  expect(s.type).toEqual(5);
  expect(s.typeName).toEqual('Polygon');
});

test('Load and verify a single part polygon', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  const r = s.shape(0);

  expect(r.xmin).toEqual(0);
  expect(r.xmax).toEqual(10.5);
  expect(r.ymin).toEqual(2);
  expect(r.ymax).toEqual(11.5);
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

  expect(r.xmin).toEqual(0);
  expect(r.xmax).toEqual(10.5);
  expect(r.ymin).toEqual(-1);
  expect(r.ymax).toEqual(10.5);
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

  const shapes = s.shapes();

  expect(shapes).toHaveLength(2);
  expect(shapes[0]).toBeInstanceOf(Polygon);
  expect(shapes[0].position).toEqual(1);
  expect(shapes[1]).toBeInstanceOf(Polygon);
  expect(shapes[1].position).toEqual(2);
});

test.skip('Export polygon shapefile as GeoJSON', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer
  );

  const json = s.asJson();

  expect(json).toEqual(polygonGeoJSON);
});

test('Get Polygon shapeRecord', () => {
  const s = new Shapefile(
    new Uint8Array(readFileSync('tests/data/polygon.shp')).buffer,
    new Uint8Array(readFileSync('tests/data/polygon.dbf')).buffer
  );
  console.log(s.fields());

  const sr = s.shapeRecord(0);

  console.log(sr);
});
