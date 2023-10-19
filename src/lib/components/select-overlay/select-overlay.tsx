import "./colors.scss";
import styles from "./select-overlay.module.scss";
import {DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH} from "../cell/cell";
import {CalenderEventValue} from "../../models";

interface SelectOverlayProps<T> {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    event: CalenderEventValue<T>
    title: string;
    color: string;
    removing: boolean;
    creating: boolean;
    mode: "Edit" | "View";
    active: boolean;
    onActive: (id: string) => void;
    onMoveClick: (overlayId: string) => void;
    onDelete: (overlayId: string, columnIndex: number) => void;
    onResizeTopClick: (overlayId: string) => void;
    onResizeBottomClick: (overlayId: string) => void;
    createModalTemplate: (event: CalenderEventValue<T>, deleteEvent: () => void, updateEvent: (event: CalenderEventValue<T>) => void) => JSX.Element;
    editModalTemplate: (event: CalenderEventValue<T>, deleteEvent: () => void, updateEvent: (event: CalenderEventValue<T>) => void) => JSX.Element;
    eventContentTemplate:(event:CalenderEventValue<T>) => JSX.Element;
}

const SelectOverlay = <T, >(props: SelectOverlayProps<T>) => {

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
                    props.onMoveClick(props.id)
                }}
            >

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
                    {props.eventContentTemplate(props.event)}
                </div>
            </div>
            {props.active && <div onMouseDown={(e)=>e.stopPropagation()} className={styles.modal} style={{
                top: `${props.top}px`,
                left: `${props.left - 400 + 5 <= 0 ? props.left + props.width + 5 : props.left - 400 - 5}px`,
                zIndex: props.active ? 10000 : 10,
            }}>
                {props.createModalTemplate(props.event, () => {
                    console.log("deleting")
                    props.onDelete(props.id, Math.trunc(props.left / DEFAULT_CELL_WIDTH))
                }, (event) => {

                })}

            </div>}

        </div>
    );
};

export default SelectOverlay;
