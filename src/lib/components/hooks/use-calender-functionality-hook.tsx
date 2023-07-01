import moment from "moment";
import { useEffect, useState } from "react";

const useCalenderFunctions = () => {
  const [originDate, setOriginDate] = useState<Date>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [allDates, setAllDates] = useState<Date[]>([]);

  useEffect(() => {
   const days = moment.weekdays();
   console.log(days)
  }, []);

  return { dates: allDates };
};

export default useCalenderFunctions;
