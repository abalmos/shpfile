export class Record {
  private dv: DataView;

  readonly isDeleted: boolean;
  readonly properties: Record<number | string | boolean>;

  constructor(dv: DataView) {
    this.dv = dv;
  }
}
