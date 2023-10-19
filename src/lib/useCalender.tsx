import React, {useEffect, useMemo, useState} from "react";
import {
    CalendarColumn, CalenderEventValue,
    Cell,
    colors,
    INTERVAL,
    OverlayColumn,
    OverlayPosition,
    TOTAL_MINUTES_FOR_DAY
} from "./models";
import moment from "moment/moment";
import {v4 as uuid} from "uuid";
import TableCell, {DEFAULT_CELL_HEIGHT, DEFAULT_CELL_WIDTH} from "./components/cell/cell";
import {FiClock} from "react-icons/fi";
import styles from "./calendar.module.scss";
import DatePicker from "./components/toolbar/date-picker/date-picker";
import Navigation from "./components/toolbar/navigation/navigation";
import SelectOverlay from "./components/select-overlay/select-overlay";


interface IOptions<T> {
    data: CalendarColumn<T>[];
    createModalTemplate: (event:CalenderEventValue<T>,deleteEvent: () => void,updateEvent: (event:CalenderEventValue<T>) => void) => JSX.Element;
    editModalTemplate: (event:CalenderEventValue<T>,deleteEvent: () => void,updateEvent: (event:CalenderEventValue<T>) => void) => JSX.Element;
    eventContentTemplate:(event:CalenderEventValue<T>) => JSX.Element;
}


const useCalender = <T,>(props: IOptions<T>) => {
    const [events, setEvents] = useState<CalendarColumn<T>[]>([])
    const [cells, setCells] = useState<Cell[]>([]);
    const [overlays, setOverlays] = useState<OverlayColumn<T>[]>([]);
    const [currentOverlayId, setCurrentOverlayId] = useState("");
    const [activeOverlayId, setActiveOverlayId] = useState("");
    const [startingOverlay, setStartingOverlay] = useState<OverlayPosition<T>>();
    const [week, setWeek] = useState<Date[]>([]);
    const [weekNumber, setWeekNumber] = useState(0);
    // const { dates } = useCalenderFunctions();
    const [todayTimeLocation, setTodayTimeLocation] = useState({
        left: 0,
        top: 0,
    })
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setInterval(() => {
            setTodayTimeLocation(getTodayLocation);
        }, 1000)

        const getTodayLocation = () => {
            let mmt = moment();
            let mmtMidnight = mmt.clone().startOf("day");
            let diffMinutes = mmt.diff(mmtMidnight, "minutes");
            return {top: ((60 / 15) * diffMinutes) + 60, left: 150 * 5};
        };
    }, [])

    useEffect(() => {
        let currentDate = moment();
        let weekStart = currentDate.clone().startOf("isoWeek");
        let days: Date[] = [];
        for (let i = 0; i <= 6; i++) {
            days.push(
                moment(weekStart).subtract(weekNumber, "weeks").add(i, "days").toDate()
            );
        }
        setWeek(days);
    }, [weekNumber]);

    const pack = () => {
        const ols = [] as OverlayColumn<T>[]
        overlays.forEach((o) => {
            o.overlayPositions.sort((a, b) => a.top - b.top);
            let currentIndent: number = 0
            o.overlayPositions.forEach((op, index) => {
                if (index < o.overlayPositions.length - 1) {
                    if (op.top + op.height > o.overlayPositions[index + 1].top) {
                        currentIndent++;
                        o.overlayPositions[index + 1].indent = currentIndent;
                    } else {
                        currentIndent = 0
                        o.overlayPositions[index + 1].indent = currentIndent;
                    }
                }
            })
            ols.push({...o})
        });
        setOverlays(ols);
    };

    const [currentAction, setCurrentAction] = useState<
        | "CREATING"
        | "MOVING"
        | "RESIZING_TOP"
        | "RESIZING_BOTTOM"
        | "SCROLLING"
        | "NONE"
    >("NONE");

    const [initialScrollPosition, setInitialScrollPosition] = useState({
        left: 0,
        x: 0,
    });


    //Add cells and overlay-columns
    useEffect(() => {
        const cells: Cell[] = [];
        const columns:OverlayColumn<T>[] = []
        const maxRowCount = TOTAL_MINUTES_FOR_DAY / INTERVAL;
        const maxColCount = 7;
        for (let cIndex = 0; cIndex < maxColCount; cIndex++) {
            cells.push({
                value: (
                    <>
                        {moment(week[cIndex]).format("DD")} <br/>
                        {moment(week[cIndex]).format("ddd")}
                    </>
                ),
                column: cIndex + 1,
                header: true,
                date: week[cIndex],
                row: 0,
            });
            const oColor = colors[cIndex % colors.length];
            columns.push({
                columnId: "id:" + uuid(),
                color: oColor,
                title: moment(week[cIndex]).format("dddd"),
                columnIndex: cIndex + 1,
                date: week[cIndex],

                weekNo: Math.round(
                    moment().clone().startOf("isoWeek").diff(week[cIndex], "weeks")
                ),
                overlayPositions:[],
            });
            for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex++) {
                if (cIndex === 0) {
                    cells.push({
                        value: (
                            <div style={{color: "#6F757E", fontSize: "12px"}}>
                                {moment
                                    .utc()
                                    .startOf("day")
                                    .add(rowIndex * 15, "minutes")
                                    .format("HH:mm")}
                            </div>
                        ),
                        column: cIndex,
                        header: false,
                        date: week[cIndex],
                        row: rowIndex + 1,
                    });
                    if (rowIndex === 0) {
                        cells.push({
                            header: false,
                            date: week[cIndex],
                            value: (
                                <>
                                    <FiClock style={{fontSize: 22, color: "#6F757E"}}/>
                                </>
                            ),
                            column: 0,
                            row: 0,
                        });
                    }
                }
                cells.push({
                    header: false,
                    value: <></>,
                    column: cIndex + 1,
                    date: week[cIndex],
                    row: rowIndex + 1,
                });
            }
        }
        setCells(cells);
        setOverlays(ps=>{
            return [...ps,...columns]
        })
    }, [week]);


    const updateCurrentOverlay = (
        callback: (overlay: OverlayPosition<T>) => OverlayPosition<T>,
        columnIndex?: number
    ) => {
        updateOverlayById(callback, currentOverlayId, columnIndex);
    };

    const updateOverlayById = (
        callback: (overlay: OverlayPosition<T>) => OverlayPosition<T>,
        id: string,
        columnIndex?: number
    ) => {
        if (columnIndex) {
            setOverlays((ps) => {
                return [
                    ...ps.map((c) => {
                        if (c.columnIndex === columnIndex) {
                            c.overlayPositions = c.overlayPositions.map((o) => {
                                if (o.id === id) {
                                    return callback(o);
                                }
                                return o;
                            });
                        }
                        return c;
                    }),
                ];
            });
        } else {
            setOverlays((ps) => {
                return [
                    ...ps.map((c) => {
                        c.overlayPositions = c.overlayPositions.map((o) => {
                            if (o.id === id) {
                                return callback(o);
                            }
                            return o;
                        });
                        return c;
                    }),
                ];
            });
        }
    };

    const getOverlayById = (id: string) => {
        const [overlay] = overlays
            .map((o) => o.overlayPositions)
            .flat()
            .filter((p) => p.id === id);
        return overlay;
    };
    const removeOverlayById = (id: string, columnIndex: number) => {
        console.log(id,columnIndex)
        updateOverlayById((o) => ({...o, removing: true}), id, columnIndex);
        setTimeout(() => {
            setOverlays((ps) => {
                return [
                    ...ps.map((o) => {
                        if (o.columnIndex === columnIndex) {
                            o.overlayPositions = o.overlayPositions.filter(
                                (op) => op.id !== id
                            );
                            return {...o};
                        }
                        return o;
                    }),
                ];
            });
            setTimeout(onUpdate, 100);
        }, 200);
    };

    const onUpdate = () => {
        pack();
    };

    const validateMoveTop = (o: OverlayPosition<T>, newTop: number) => {
        let validatedTop = newTop;
        if (DEFAULT_CELL_HEIGHT > newTop) {
            validatedTop = DEFAULT_CELL_HEIGHT;
        }
        return validatedTop;
    };
    const validateResizeTop = (
        o: OverlayPosition<T>,
        newTop: number,
        newHeight: number
    ) => {
        let validatedTop = newTop;
        let validatedHeight = newHeight;

        if (newHeight <= DEFAULT_CELL_HEIGHT) {
            //new
            validatedTop =
                Math.round(o.top / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
            validatedHeight = DEFAULT_CELL_HEIGHT; //new
        }

        const [column] = overlays.filter(
            (ov) => ov.columnIndex === o.left / DEFAULT_CELL_WIDTH
        );
        if (column) {
            const sOverlays =
                [...column.overlayPositions].sort((a, b) => a.top - b.top) || [];
            if (sOverlays.length > 1) {
                const thisIndex = sOverlays.findIndex((s) => s.id === o.id);
                const topIndex = thisIndex - 1;
                if (topIndex !== -1) {
                    const top = sOverlays[topIndex];
                    const minTop = top.top + top.height;
                    if (newTop < minTop) {
                        validatedTop = minTop;
                        validatedHeight =
                            Math.round(o.height / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                    }
                } else {
                    if (DEFAULT_CELL_HEIGHT > newTop) {
                        validatedTop = DEFAULT_CELL_HEIGHT;
                        validatedHeight =
                            Math.round(o.height / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                    }
                }
            }
        }

        return {validatedTop, validatedHeight};
    };
    const validateResizeBottom = (o: OverlayPosition<T>, newHeight: number) => {
        let validatedHeight = newHeight;

        if (newHeight <= DEFAULT_CELL_HEIGHT) {
            //new
            validatedHeight = DEFAULT_CELL_HEIGHT; //new
        }

        const [column] = overlays.filter(
            (ov) => ov.columnIndex === o.left / DEFAULT_CELL_WIDTH
        );
        if (column) {
            const sOverlays =
                [...column.overlayPositions].sort((a, b) => a.top - b.top) || [];
            if (sOverlays.length > 1) {
                const thisIndex = sOverlays.findIndex((s) => s.id === o.id);
                const bottomIndex = thisIndex + 1;
                if (bottomIndex < sOverlays.length) {
                    const bottom = sOverlays[bottomIndex];
                    if (bottom.top <= o.top + newHeight) {
                        validatedHeight =
                            Math.round(o.height / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                    }
                } else {
                    if (
                        (TOTAL_MINUTES_FOR_DAY / INTERVAL + 1) * DEFAULT_CELL_HEIGHT <=
                        o.top + newHeight
                    ) {
                        validatedHeight =
                            Math.round(o.height / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                    }
                }
            }
        }

        return validatedHeight;
    };

    const cursor = useMemo(() => {
        switch (currentAction) {
            case "CREATING":
                return "grabbing";
            case "MOVING":
                return "move";
            case "RESIZING_TOP":
                return "row-resize";
            case "RESIZING_BOTTOM":
                return "row-resize";
            case "SCROLLING":
                return "all-scroll";
            default:
                return "default";
        }
    }, [currentAction]);


    const getColumnByX = (x: number) => {
        // console.log("X:",x,Math.trunc(x / DEFAULT_CELL_WIDTH))
        return Math.trunc(x / DEFAULT_CELL_WIDTH);

    }

    const getRowByY = (y: number) => {
        // console.log("Y:",y,Math.trunc(y / DEFAULT_CELL_HEIGHT))
        return Math.trunc(y / DEFAULT_CELL_HEIGHT);
    }

    const calender = (
        <div>
            <div>
                <div className={styles.toolbar}>
                    <DatePicker/>
                    <Navigation
                        next={() => setWeekNumber((ps) => ps - 1)}
                        previous={() => setWeekNumber((ps) => ps + 1)}
                    />
                </div>
            </div>
            <div
                className={styles.appTableContainer}
                onMouseUp={() => {
                    updateCurrentOverlay((o) => {
                        const updatedTop =
                            Math.round(o.top / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                        const updatedHeight =
                            Math.round(o.height / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                        return {...o, top: updatedTop, height: updatedHeight};
                    });
                    // setIsMoving(false);
                    if (currentAction !== "NONE") {
                        if (currentAction !== "CREATING" && currentAction !== "SCROLLING")
                            setTimeout(onUpdate, 100);
                    }

                    setCurrentAction("NONE");
                    // setActiveOverlayId("");
                }}
            >
                <div
                    className={`${styles.table} ${styles.scroll}`}
                    style={{
                        height:
                            DEFAULT_CELL_HEIGHT * (TOTAL_MINUTES_FOR_DAY / INTERVAL) +
                            DEFAULT_CELL_HEIGHT +
                            40 +
                            "px",
                        cursor: cursor,
                    }}

                    onMouseDown={(e) => {

                        const _x = e.pageX - e.currentTarget.getBoundingClientRect().x;
                        const _y = e.pageY - e.currentTarget.getBoundingClientRect().y;
                        const _column = getColumnByX(_x);
                        const _row = getRowByY(_y);
                        const isCtrPressed = e.ctrlKey;
                        const ele = e.currentTarget;
                        if (isCtrPressed) {
                            setCurrentAction("SCROLLING");
                            setInitialScrollPosition({
                                left: ele.scrollLeft,
                                x: e.clientX,
                            });
                        } else {

                            if (currentAction === "CREATING") {
                                setCurrentAction("NONE");
                            } else {

                                const [column] = overlays.filter(
                                    (o) => o.columnIndex === _column
                                );
                                if (column) {
                                    const id = uuid();
                                    setCurrentAction("CREATING");
                                    setOverlays((ps) => {
                                        const [os] = ps.filter(
                                            (o) => o.columnIndex === _column
                                                && o.weekNo === weekNumber
                                        );

                                        if (os) {

                                            os.overlayPositions.push({
                                                id: id,
                                                top: getRowByY(_y) * DEFAULT_CELL_HEIGHT,
                                                left: getColumnByX(_x) * DEFAULT_CELL_WIDTH,
                                                height: DEFAULT_CELL_HEIGHT, //new
                                                width: DEFAULT_CELL_WIDTH,
                                                title:"this is title",
                                                active: false,
                                                description:"",
                                                indent: 0,
                                                center: {
                                                    column: _column,
                                                    row: _row,
                                                    value: <></>,
                                                    date: new Date(),
                                                    header: false

                                                },
                                                color:
                                                    colors[Math.floor(Math.random() * colors.length)],
                                                removing: false,
                                            });
                                        }

                                        return [...ps];
                                    });
                                    setCurrentOverlayId(id);
                                }
                            }
                        }
                    }}
                    onMouseMove={(e) => {
                        const _x = e.pageX - e.currentTarget.getBoundingClientRect().x;
                        const _y = e.pageY - e.currentTarget.getBoundingClientRect().y;

                        const ele = e.currentTarget;

                        const box = ele.getBoundingClientRect();
                        const body = document.body;
                        const docEl = document.documentElement;
                        const scrollTopX =
                            window.pageYOffset || docEl.scrollTop || body.scrollTop;
                        const clientTop = docEl.clientTop || body.clientTop || 0;
                        const tableDivTop = box.top + scrollTopX - clientTop;
                        const scrollTop = e.currentTarget.scrollTop;

                        switch (currentAction) {
                            case "MOVING":
                                updateCurrentOverlay((o) => {
                                    const newTop =
                                        e.pageY - (tableDivTop + o.height / 2) + scrollTop;
                                    return {
                                        ...o,
                                        top: validateMoveTop(o, newTop),
                                    };
                                });

                                break;
                            case "RESIZING_TOP":
                                updateCurrentOverlay((o) => {
                                    const newTop = e.pageY - tableDivTop + scrollTop;
                                    const newHeight =
                                        (startingOverlay?.height || 0) -
                                        (e.pageY -
                                            tableDivTop +
                                            scrollTop -
                                            (startingOverlay?.top || 0));
                                    const {validatedHeight, validatedTop} = validateResizeTop(
                                        o,
                                        newTop,
                                        newHeight
                                    );
                                    return {
                                        ...o,
                                        top: validatedTop,
                                        height: validatedHeight,
                                    };
                                });
                                break;
                            case "RESIZING_BOTTOM":
                                updateCurrentOverlay((o) => {
                                    const newHeight = e.pageY + scrollTop - (o.top + tableDivTop);

                                    return {
                                        ...o,
                                        height: validateResizeBottom(o, newHeight),
                                    };
                                });
                                break;
                            case "SCROLLING": {
                                const dx = e.clientX - initialScrollPosition.x;
                                ele.scrollLeft = initialScrollPosition.left - dx;

                                // ele.animate({ scrollLeft: 25 }, 300);
                            }
                                break;
                            case "CREATING":
                                updateCurrentOverlay((o) => {
                                    const a = (getRowByY(_y) - o.center.row) * DEFAULT_CELL_HEIGHT;
                                    return {
                                        ...o,
                                        top: a <= 0 ? getRowByY(_y) * DEFAULT_CELL_HEIGHT : o.top,
                                        height: Math.abs(a) + DEFAULT_CELL_HEIGHT, //new
                                    };
                                }, getColumnByX(_x));

                                break;
                        }
                    }}
                    onMouseUp={(e) => {
                        const _x = e.pageX - e.currentTarget.getBoundingClientRect().x;
                        const _y = e.pageY - e.currentTarget.getBoundingClientRect().y;
                        const _column = getColumnByX(_x);
                        const _row = getRowByY(_y);
                        if (currentAction === "CREATING") {
                            updateCurrentOverlay((o) => {
                                const a = (_row - o.center.row) * DEFAULT_CELL_HEIGHT;
                                return {
                                    ...o,
                                    top: a <= 0 ? _row * DEFAULT_CELL_HEIGHT : o.top,
                                    height: Math.abs(a) + DEFAULT_CELL_HEIGHT,
                                };
                            }, _column);
                            setActiveOverlayId(currentOverlayId)
                            setCurrentOverlayId("");

                            onUpdate();
                        }
                        // setCurrentAction("NONE");
                    }}
                >
                    {cells.map((cell, index) => (
                        <TableCell
                            key={index}
                            type={cell.header ? "header" : "text"}
                            value={<>{cell.value}</>}
                            column={cell.column}
                            row={cell.row}
                            isDragging={currentAction === "CREATING"}
                            mode={"Edit"}
                        />
                    ))}
                    {overlays
                        .filter(o => o.weekNo === weekNumber)
                        .map((c) => {
                            return c.overlayPositions.map((o) => {
                                return (
                                    <SelectOverlay
                                        createModalTemplate={props.createModalTemplate}
                                        editModalTemplate={props.editModalTemplate}
                                        eventContentTemplate={props.eventContentTemplate}
                                        event={{
                                            startTime:o.top,
                                            endTime:o.top+o.height,
                                            description:o.description,
                                            title:o.title,
                                            repetition:"",
                                            data:o.data
                                        }}
                                        key={o.id}
                                        id={o.id}
                                        height={o.height}
                                        width={o.width - 2 - (o.indent * 12)}
                                        title={o.title}
                                        top={o.top}
                                        left={o.left + 1 + (o.indent * 10)}
                                        mode={"Edit"}
                                        color={c.color}
                                        active={o.id === activeOverlayId}
                                        onActive={(id) => {
                                            setActiveOverlayId(id)
                                        }}
                                        removing={o.removing}
                                        creating={
                                            currentAction === "CREATING" && currentOverlayId === o.id
                                        }
                                        onMoveClick={(id) => {
                                            setActiveOverlayId(id);
                                            setCurrentOverlayId(id)
                                            setCurrentAction("MOVING");
                                        }}
                                        onDelete={(id, columnIndex) => {
                                            removeOverlayById(id, columnIndex);
                                        }}
                                        onResizeTopClick={(id) => {
                                            const overlay = getOverlayById(id);
                                            if (overlay) {
                                                setCurrentOverlayId(id);
                                                setCurrentAction("RESIZING_TOP");
                                                setStartingOverlay(overlay);
                                            }
                                        }}
                                        onResizeBottomClick={(id) => {
                                            const overlay = getOverlayById(id);
                                            if (overlay) {
                                                setCurrentOverlayId(id);
                                                setCurrentAction("RESIZING_BOTTOM");
                                                setStartingOverlay(overlay);
                                            }
                                        }}
                                    />
                                );
                            });
                        })
                        .flat()}

                    <div style={todayTimeLocation} className={styles.today}>

                    </div>
                </div>
            </div>
        </div>
    );

    const loadData = (data: any) => {

    }

    const data = useMemo(() => {
        return null;
    }, [])

    const addRange = (date: string): string => {
        return "GEN_ID"
    }


    return {calender, loadData, events}

}

export default useCalender;