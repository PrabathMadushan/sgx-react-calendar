import DatePicker from "../lib/components/toolbar/date-picker/date-picker";
import Navigation from "../lib/components/toolbar/navigation/navigation";
import AppTable from "../lib/table";
import styles from "./index.module.scss";

const Demo = () => {
  return (
    <div className={styles.page}>
      <div>
        <h1>React Calendar View</h1>
      </div>
      <div className={styles.toolbar}>
        <DatePicker />
        <Navigation />
      </div>
      <div className={styles.container}>
        <AppTable
          data={[
            {
              date: new Date("2022-01-03"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-04"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-05"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-06"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-07"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-08"),
              id: "3",
              timeSlots: [],
            },
            {
              date: new Date("2022-01-09"),
              id: "3",
              timeSlots: [],
            },
          ]}
          mode="Edit"
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default Demo;
