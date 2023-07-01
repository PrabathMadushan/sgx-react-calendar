import styles from "./navigation.module.scss";
import { GrFormNext } from "react-icons/gr";

interface IProps{
  next:()=>void,
  previous:()=>void
}

const Navigation = (props:IProps) => {
  return <div className={styles.container}>
    <GrFormNext style={{transform: "rotate(180deg)"}} onClick={props.previous}/>
    <GrFormNext  onClick={props.next}/>
  </div>;
};

export default Navigation;
