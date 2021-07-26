import styles from "./header.module.scss";
import Link from "next/link";

export default function Header() {
  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/"><a><img src="/images/spacetraveling.svg" alt="logo" /></a></Link>
      </div>
    </header>
  );
}
