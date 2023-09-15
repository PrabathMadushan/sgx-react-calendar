import moment from "moment";
import { useEffect, useState } from "react";

interface IOptions{

}

const useCalenderFunctions = () => {
  const [originDate, setOriginDate] = useState<Date>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [allDates, setAllDates] = useState<Date[]>([]);


  const addTimeRange = () => {
    
  }

  const removeTimeRange = () => {
    
  }

  const updateTimeRange = () => {
    
  }



  useEffect(() => {
   const days = moment.weekdays();
   console.log(days)
  }, []);

  const table = <div></div>

  return { dates: allDates };
};

export default useCalenderFunctions;
