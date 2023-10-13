import moment from "moment";
import {BsArrowsMove} from "react-icons/bs";
import {RiCloseFill} from "react-icons/ri";
import {INTERVAL} from "../../calender";
import {DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH} from "../cell/cell";
import "./colors.scss";
import styles from "./select-overlay.module.scss";
import {useState} from "react";

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
    active:boolean;
    setActive:(id:string)=>void;
    onMouseClick: (overlayId: string) => void;
    onDelete: (overlayId: string, columnIndex: number) => void;
    onResizeTopClick: (overlayId: string) => void;
    onResizeBottomClick: (overlayId: string) => void;
}

const SelectOverlay = (props: SelectOverlayProps) => {

    return (
        <div
            className={`${styles.selectOverlay} ${props.color}`}
            style={{
                top: `${props.top}px`,
                left: `${props.left}px`,
                width: `${props.width}px`,
                height: `${props.height}px`,
                // display: `${props.width === 0 || props.height === 0 ? "none" : "flex"}`,
                border: `solid 2px ${props.color}`,
                // backgroundColor:props.active?"#2196f3":"inherit",
                zIndex:props.active?10000:10,
                opacity: props.removing ? 0 : 1,

            }}
            onMouseDown={(e)=>{
                    console.log("mouse enter")
                    // e.stopPropagation()
                    props.setActive(props.id)
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
    );
};

export default SelectOverlay;
