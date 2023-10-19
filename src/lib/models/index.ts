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

export interface CalendarColumn<D> {
  date:Date;
  events:CalenderEventValue<D>[]
}

export interface CalenderEventValue<D>{
  startTime:number;
  endTime:number;
  title?:string;
  description?:string;
  repetition?:any;
  data?:D
}

export interface ITableData<D> {
  data: TableColumn<D>[];
  mode: "Edit" | "View";
  onChange: (data: TableColumn<D>[]) => void;
}

export interface OverlayColumn<D> {
  columnId: string;
  columnIndex: number;
  color: string;
  title: string;
  overlayPositions: OverlayPosition<D>[];
  weekNo: number;
  date: Date;
}

export interface OverlayPosition<D> {
  id: string;
  width: number;
  height: number;
  top: number;
  left: number;
  indent: number;
  data?:D,
  title:string;
  description:string;
  active: boolean;
  center: Cell;
  color: string;
  removing: boolean;
}

export const colors = [
  "color01",
  "color02",
  "color03",
  "color04",
  "color05",
  "color06",
  "color07",
  "color08",
  "color09",
  "color10",
];

export const TOTAL_MINUTES_FOR_DAY = 60 * 24;
export const INTERVAL = 15;
