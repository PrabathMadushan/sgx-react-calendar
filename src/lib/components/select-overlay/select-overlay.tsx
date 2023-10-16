import "./colors.scss";
import styles from "./select-overlay.module.scss";
import {DEFAULT_CELL_HEIGHT} from "../cell/cell";

interface SelectOverlayProps {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    removing: boolean;
    creating: boolean;
    mode: "Edit" | "View";
    active: boolean;
    onActive: (id: string) => void;
    onMouseClick: (overlayId: string) => void;
    onDelete: (overlayId: string, columnIndex: number) => void;
    onResizeTopClick: (overlayId: string) => void;
    onResizeBottomClick: (overlayId: string) => void;
}

const SelectOverlay = (props: SelectOverlayProps) => {

    return (
        <div className={styles.overlayContainer}>

            <div
                className={`${styles.selectOverlay} ${props.active ? props.color + "Active " : props.color}`}
                style={{
                    top: `${props.top}px`,
                    left: `${props.left}px`,
                    width: `${props.width}px`,
                    height: `${props.height}px`,
                    border: `solid 2px ${props.color}`,
                    zIndex: props.active ? 10000 : 10,
                    opacity: props.removing ? 0 : 1,

                }}
                onMouseDown={(e) => {
                    console.log("mouse enter")
                    e.stopPropagation()
                    props.onActive(props.id)
                }}
            >
                {/* {props.mode === "Edit" && (
        <div
          className={`${styles.btnClose} ${props.color}b`}
          onClick={() => {
            if (props.mode === "Edit")
              props.onDelete(props.id, props.left / DEFAULT_CELL_WIDTH);
          }}
        >
          <RiCloseFill />
        </div>
      )} */}
                {/* {props.mode === "Edit" && (
        <div
          className={`${styles.resizeTop} ${props.color}b`}
          onMouseDown={() => {
            if (props.mode === "Edit") props.onResizeTopClick(props.id);
          }}
        ></div>
      )}
      {props.mode === "Edit" && (
        <div
          className={`${styles.resizeBottom} ${props.color}b`}
          onMouseDown={() => {
            if (props.mode === "Edit") props.onResizeBottomClick(props.id);
          }}
        ></div>
      )}
      {props.mode === "Edit" && !props.creating && (
        <div
          className={styles.move}
          onMouseDown={() => {
            if (props.mode === "Edit") props.onMoveClick(props.id);
          }}
        >
          <BsArrowsMove />
        </div>
      )} */}
                <div
                    onDragStart={() => {
                        return false;
                    }}
                    style={{
                        position: "absolute",
                        top: "2px",
                        left: "5px",
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                >
                    {/* {moment
          .utc()
          .startOf("day")
          .add((props.top / DEFAULT_CELL_HEIGHT - 1) * INTERVAL, "minutes")
          .format("HH:mm")}
        -{" "}
        {moment
          .utc()
          .startOf("day")
          .add(
            (props.height / DEFAULT_CELL_HEIGHT -
              1 +
              props.top / DEFAULT_CELL_HEIGHT) *
              INTERVAL,
            "minutes"
          )
          .format("HH:mm")} */}
                    this is title
                </div>
            </div>
            {props.active &&   <div className={styles.modal} style={{
                top: `${props.top}px`,
                left: `${props.left-410}px`,
                zIndex: props.active ? 10000 : 10,
            }}>
                <h3>this is title</h3>
                <div>from:{props.top/DEFAULT_CELL_HEIGHT-1} | to:{(props.top+props.height) / DEFAULT_CELL_HEIGHT - 1}</div>
            </div>}

        </div>
    );
};

export default SelectOverlay;
