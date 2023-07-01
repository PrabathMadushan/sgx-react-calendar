import styles from "./navigation.module.scss";
import { GrFormNext } from "react-icons/gr";
const Navigation = () => {
  return <div className={styles.container}>
    <GrFormNext style={{transform: "rotate(180deg)"}}/>
    <GrFormNext />
  </div>;
};

export default Navigation;
