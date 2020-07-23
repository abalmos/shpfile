export interface Field {
  name: string;
  type: string;
  length: number;
  decimalLength: number;
}

export type Property = string | number | boolean | Date | undefined;
export type Properties = { [key: string]: Property };

export interface Record {
  position: number;
  isDeleted: boolean;
  properties: Properties;
}

export class DBF {
  public version: number;
  public date: Date;

  public numRecords: number;
  public lenHeader: number;
  public lenRecord: number;
  public fields: Field[] = [];

  private dbf: DataView;
  private enc: TextDecoder;

  constructor(dbf: ArrayBuffer) {
    this.dbf = new DataView(dbf);
    this.enc = new TextDecoder('utf-8');

    this.version = this.dbf.getUint8(0);
    this.date = new Date(
      this.dbf.getUint8(1),
      this.dbf.getUint8(2) - 1,
      this.dbf.getUint8(3)
    );

    this.numRecords = this.dbf.getUint32(4, true);
    this.lenHeader = this.dbf.getUint16(8, true);
    this.lenRecord = this.dbf.getUint16(10, true);

    if (this.dbf.getUint8(14)) {
      throw new Error('DBF has ongoing transaction.');
    }

    if (this.dbf.getUint8(15)) {
      throw new Error('DBF is encrypted.');
    }

    let offset = 32;
    // TODO: Also check for end of file?
    while (this.dbf.getUint8(offset) != 0x0d) {
      this.fields.push({
        name: this.enc
          .decode(dbf.slice(offset, offset + 10))
          .replace(/\0/g, ''),
        type: this.enc.decode(dbf.slice(offset + 11, offset + 12)),
        length: this.dbf.getUint8(offset + 16),
        decimalLength: this.dbf.getUint8(offset + 17),
      });

      offset += 32;
    }
  }

  record(idx: number): Record {
    let offset = this.lenHeader + idx * this.lenRecord;

    const isDeleted = this.dbf.getUint8(offset) == 84 ? true : false;

    offset++;

    // All values are stored as strings in DBF, convert to actual data type
    const properties: Properties = {};
    this.fields.forEach((field) => {
      const raw = this.enc
        .decode(this.dbf.buffer.slice(offset, offset + field.length))
        .trim();

      let value: Property;
      switch (field.type) {
        case 'C':
          value = raw;
          break;

        case 'N':
        case 'F':
          value = parseFloat(raw);
          break;

        case 'D':
          value = new Date(
            parseInt(raw.slice(0, 4)),
            parseInt(raw.slice(4, 6)) - 1,
            parseInt(raw.slice(6, 8))
          );
          break;

        case 'L':
          if (['y', 'Y', 't', 'T'].includes(raw)) {
            value = true;
          } else if (['n', 'N', 'f', 'F'].includes(raw)) {
            value = false;
          }
          break;
      }

      offset += field.length;

      properties[field.name] = value;
    }, {});

    return {
      position: idx + 1,
      isDeleted,
      properties,
    };
  }

  records(): Record[] {
    const records = new Array(this.numRecords);
    for (let i = 0; i < this.numRecords; i++) {
      records[i] = this.record(i);
    }

    return records;
  }
}
