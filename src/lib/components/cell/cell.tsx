import { Cell } from "../../models";
import styles from "./cell.module.scss";

interface CellProps {
  column: number;
  row: number;
  value: JSX.Element;
  type?: "header" | "text";
  onMouseDown?: (cell: Cell) => void;
  onMouseUp?: (cell: Cell) => void;
  onMouseMove?: (cell: Cell) => void;
  isDragging: boolean;
  mode: "Edit" | "View";
}

export const DEFAULT_CELL_WIDTH = 150;
export const DEFAULT_CELL_HEIGHT = 60;

const TableCell = (props: CellProps) => {
  return (
    <div
      className={`${styles.cell} ${
        props.type === "header" ? styles.headerCell : ""
      }`}
      onMouseDown={(e) => {
        if (props.mode === "Edit" && props.type === "text") {
          const isCtrPressed = e.ctrlKey;
          if (!isCtrPressed && props.onMouseDown) {
            props.onMouseDown({
              column: props.column,
              row: props.row,
              value: props.value,
              header: false,
              date: new Date(),
            });
          }
        }
      }}
      onMouseUp={() => {
        if (props.mode === "Edit" && props.type === "text"  && props.onMouseUp)
          props.onMouseUp({
            column: props.column,
            row: props.row,
            value: props.value,
            header: false,
            date: new Date(),
          });
      }}
      onMouseMove={() => {
        if (props.mode === "Edit" && props.type === "text" && props.onMouseMove)
          props.onMouseMove({
            column: props.column,
            row: props.row,
            value: props.value,
            header: false,
            date: new Date(),
          });
      }}
      onDragStart={() => false}
      style={{
        width: `${DEFAULT_CELL_WIDTH}px`,
        height: `${DEFAULT_CELL_HEIGHT}px`,
        top: `${DEFAULT_CELL_HEIGHT * props.row}px`,
        left: `${DEFAULT_CELL_WIDTH * props.column}px`,
      }}
    >
      {/* <input value={value} onChange={(e) => setValue(e.target.value)} /> */}
      {props.value}
    </div>
  );
};

export default TableCell;
