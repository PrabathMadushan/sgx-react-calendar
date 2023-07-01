import styles from './data-picker.module.scss'
import { MdOutlineCalendarMonth } from 'react-icons/md'
const DatePicker = () => {
  return <div className={styles.container}>
    <MdOutlineCalendarMonth/>
  </div>;
};

export default DatePicker;
