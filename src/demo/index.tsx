import styles from "./index.module.scss";
import useCalender from "../lib/useCalender";

const Demo = () => {

    const {events, calender} = useCalender<{ deviceCategory: string, applyForChildSpaces: boolean }>(
        {
            data: [{
                date: new Date(),
                events: [{
                    startTime: 15, endTime: 15 * 3, title: "this is title 01", description: "this is description", data: {
                        applyForChildSpaces: false,
                        deviceCategory: ""
                    }
                }]
            }],
            createModalTemplate: (event,deleteRange,updateEvent) => {
                return <div>
                    <h3>{event.title}</h3>

                    kamal
                </div>
            },
            editModalTemplate: (event,deleteRange,updateEvent) => {
                return <div></div>
            }

        }
    )


    return (
        <div className={styles.page}>
            <div>
                <h1>React Calendar View</h1>
            </div>

            <div className={styles.container}>
                {calender}
            </div>
        </div>
    );
};

export default Demo;
