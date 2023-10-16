import moment from "moment";
import {useEffect, useMemo, useState} from "react";
import {FiClock} from "react-icons/fi";
import {v4 as uuid} from "uuid";
import TableCell, {
    DEFAULT_CELL_HEIGHT,
    DEFAULT_CELL_WIDTH,
} from "./components/cell/cell";
import SelectOverlay from "./components/select-overlay/select-overlay";
import {Cell, TableColumn} from "./models";
import styles from "./calendar.module.scss";
import DatePicker from "./components/toolbar/date-picker/date-picker";
import Navigation from "./components/toolbar/navigation/navigation";

interface ITableData<D> {
    data: TableColumn<D>[];
    mode: "Edit" | "View";
    onChange: (data: TableColumn<D>[]) => void;
}

interface OverlayCol {
    columnId: string;
    columnIndex: number;
    color: string;
    title: string;
    overlayPositions: OverlayPosition[];
    weekNo: number;
    date: Date;
}

interface OverlayPosition {
    id: string;
    width: number;
    height: number;
    top: number;
    left: number;
    indent: number;
    active: boolean;
    center: Cell;
    color: string;
    removing: boolean;
}

const colors = [
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

const AppTable = (props: ITableData<any>) => {
    const [cells, setCells] = useState<Cell[]>([]);
    const [overlays, setOverlays] = useState<OverlayCol[]>([]);
    const [activeOverlayId, setActiveOverlayId] = useState("");
    const [startingOverlay, setStartingOverlay] = useState<OverlayPosition>();
    const [week, setWeek] = useState<Date[]>([]);
    const [weekNumber, setWeekNumber] = useState(0);
    // const { dates } = useCalenderFunctions();
    const [todayTimeLocation, setTodayTimeLocation] = useState({
        left: 0,
        top: 0,
    })

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
        const ols = [] as OverlayCol[]
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

    useEffect(() => {
        const columns = props.data;
        const cells: Cell[] = [];
        const overlayCols: OverlayCol[] = [];
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
            overlayCols.push({
                columnId: props.data[cIndex].id,
                color: oColor,
                title: moment(props.data[cIndex].date).format("dddd"),
                columnIndex: cIndex + 1,
                date: props.data[cIndex].date,

                weekNo: Math.round(
                    moment().clone().startOf("isoWeek").diff(week[cIndex], "weeks")
                ),
                overlayPositions: columns[cIndex].timeSlots.map((r) => {
                    return {
                        id: uuid(),
                        width: DEFAULT_CELL_WIDTH,
                        height: (r.to / 15 - r.from / 15) * DEFAULT_CELL_HEIGHT,
                        top: (r.from / 15 + 1) * DEFAULT_CELL_HEIGHT,
                        left: (cIndex + 1) * DEFAULT_CELL_WIDTH,
                        removing: false,
                        active: false,
                        indent: 0,
                        center: {
                            column: cIndex,
                            row: r.from,
                            value: <></>,
                            header: false,
                            date: props.data[cIndex].date,
                        },
                        color: oColor,
                    };
                }),
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
                        date: props.data[cIndex].date,
                        row: rowIndex + 1,
                    });
                    if (rowIndex === 0) {
                        cells.push({
                            header: false,
                            date: props.data[cIndex].date,
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
                    date: props.data[cIndex].date,
                    row: rowIndex + 1,
                });
            }
        }
        setCells(cells);
        setOverlays((ps) => {
            return [...ps, ...overlayCols]
        });
    }, [props.data, week]);

    const updateCurrentOverlay = (
        callback: (overlay: OverlayPosition) => OverlayPosition,
        columnIndex?: number
    ) => {
        updateOverlayById(callback, activeOverlayId, columnIndex);
    };

    const updateOverlayById = (
        callback: (overlay: OverlayPosition) => OverlayPosition,
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
        const x = overlays.map((o) => {
            return {
                id: o.columnId,
                date: new Date(),
                timeSlots: o.overlayPositions.map((p) => {
                    return {
                        from: (p.top / DEFAULT_CELL_HEIGHT - 1) * 15,
                        to:
                            (p.top / DEFAULT_CELL_HEIGHT - 1) * 15 +
                            (p.height / DEFAULT_CELL_HEIGHT) * 15,
                        data: {} as any,
                        description: "string",
                        title: o.title,
                    };
                }),
            };
        });
        props.onChange(x);
        pack();
    };

    const validateMoveTop = (o: OverlayPosition, newTop: number) => {
        let validatedTop = newTop;

        if (DEFAULT_CELL_HEIGHT > newTop) {
            validatedTop = DEFAULT_CELL_HEIGHT;
        } else {
            const [column] = overlays.filter(
                (ov) => ov.columnIndex === o.left / DEFAULT_CELL_WIDTH
            );
            if (column) {
                const sOverlays =
                    [...column.overlayPositions].sort((a, b) => a.top - b.top) || [];
                if (sOverlays.length > 1) {
                    const thisIndex = sOverlays.findIndex((s) => s.id === o.id);
                    const topIndex = thisIndex - 1;
                    const bottomIndex = thisIndex + 1;

                    if (topIndex !== -1) {
                        const top = sOverlays[topIndex];
                        const minTop = top.top + top.height;
                        if (newTop < minTop) {
                            validatedTop = minTop;
                        }
                    } else {
                        if (DEFAULT_CELL_HEIGHT > newTop) {
                            validatedTop = DEFAULT_CELL_HEIGHT;
                        }
                    }

                    if (bottomIndex < sOverlays.length) {
                        const bottom = sOverlays[bottomIndex];
                        const maxTop = bottom.top - o.height;
                        if (newTop > maxTop) {
                            validatedTop = maxTop;
                        }
                    } else {
                        if (
                            (TOTAL_MINUTES_FOR_DAY / INTERVAL + 1) * DEFAULT_CELL_HEIGHT <=
                            newTop + o.height
                        ) {
                            validatedTop =
                                Math.round(o.top / DEFAULT_CELL_HEIGHT) * DEFAULT_CELL_HEIGHT;
                        }
                    }
                }
            }
        }

        return validatedTop;
    };
    const validateResizeTop = (
        o: OverlayPosition,
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
    const validateResizeBottom = (o: OverlayPosition, newHeight: number) => {
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

    return (
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
                                    // const x = column.overlayPositions.filter(
                                    //     (o) =>
                                    //         o.top + o.height > _row * DEFAULT_CELL_HEIGHT &&
                                    //         o.top <= _row * DEFAULT_CELL_HEIGHT
                                    // );

                                    // if (true) {
                                    const id = uuid();
                                    setCurrentAction("CREATING");
                                    setOverlays((ps) => {
                                        const [os] = ps.filter(
                                            (o) => o.columnIndex === _column
                                                && o.weekNo === weekNumber
                                        );

                                        if (os) {
                                            console.log("center:", {
                                                column: _column,
                                                row: _row,
                                                value: <></>,
                                                date: new Date(),
                                                header: false
                                            })
                                            os.overlayPositions.push({
                                                id: id,
                                                top: getRowByY(_y) * DEFAULT_CELL_HEIGHT,
                                                left: getColumnByX(_x) * DEFAULT_CELL_WIDTH,
                                                height: DEFAULT_CELL_HEIGHT, //new
                                                width: DEFAULT_CELL_WIDTH,
                                                active: false,
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
                                    setActiveOverlayId(id);
                                    // }
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
                            default: {
                                updateCurrentOverlay((o) => {
                                    const a = (getRowByY(_y) - o.center.row) * DEFAULT_CELL_HEIGHT;
                                    return {
                                        ...o,
                                        top: a <= 0 ? getRowByY(_y) * DEFAULT_CELL_HEIGHT : o.top,
                                        height: Math.abs(a) + DEFAULT_CELL_HEIGHT, //new
                                    };
                                }, getColumnByX(_x));
                            }
                                break;
                        }

                        if (currentAction === "CREATING") {

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
                            setActiveOverlayId("");
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
                            mode={props.mode}
                        />
                    ))}
                    {overlays
                        .filter(o => o.weekNo === weekNumber)
                        .map((c) => {
                            return c.overlayPositions.map((o) => {
                                return (
                                    <SelectOverlay
                                        key={o.id}
                                        id={o.id}
                                        height={o.height}
                                        width={o.width - 2 - (o.indent * 12)}
                                        top={o.top}
                                        left={o.left + 1 + (o.indent * 10)}
                                        mode={props.mode}
                                        color={c.color}
                                        active={o.id === activeOverlayId}
                                        onActive={(id) => {
                                            setActiveOverlayId(id)
                                        }}
                                        removing={o.removing}
                                        creating={
                                            currentAction === "CREATING" && activeOverlayId === o.id
                                        }
                                        onMouseClick={(id) => {
                                            setActiveOverlayId(id);
                                            setCurrentAction("MOVING");
                                        }}
                                        onDelete={(id, columnIndex) => {
                                            removeOverlayById(id, columnIndex);
                                        }}
                                        onResizeTopClick={(id) => {
                                            const overlay = getOverlayById(id);
                                            if (overlay) {
                                                setActiveOverlayId(id);
                                                setCurrentAction("RESIZING_TOP");
                                                setStartingOverlay(overlay);
                                            }
                                        }}
                                        onResizeBottomClick={(id) => {
                                            const overlay = getOverlayById(id);
                                            if (overlay) {
                                                setActiveOverlayId(id);
                                                setCurrentAction("RESIZING_BOTTOM");
                                                setStartingOverlay(overlay);
                                            }
                                        }}
                                    />
                                );
                            });
                        })
                        .flat()}

                    <div style={todayTimeLocation} className={styles.today}></div>
                </div>
            </div>
        </div>
    );
};

export default AppTable;
