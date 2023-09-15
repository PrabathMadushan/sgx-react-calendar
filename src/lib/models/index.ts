// export interface SGXTable {}

export interface TableColumn<D> {
  id: string;
  date:Date;
  timeSlots: TableCellValue<D>[];
}

export interface TableRow {
  id: string;
  height: number;
}

export interface Cell {
  value: JSX.Element;
  column: number;
  row: number;
  header: boolean;
  date:Date
}

export interface TableData<D> {
  columns: TableColumn<D>[];
}

export interface TableCellValue<D> {
  from: number;
  to: number;
  title:string;
  description:string;
  data:D
}
