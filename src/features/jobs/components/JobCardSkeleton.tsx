import styles from './JobCardSkeleton.module.css';

export default function JobCardSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo} />
        <div className={styles.info}>
          <div className={styles.title} />
          <div className={styles.company} />
          <div className={styles.meta}>
            <div className={styles.metaItem} />
            <div className={styles.metaItem} />
            <div className={styles.metaItem} />
          </div>
        </div>
        <div className={styles.salary} />
      </div>
      
      <div className={styles.tags}>
        <div className={styles.tag} />
        <div className={styles.tag} />
        <div className={styles.tag} />
      </div>
      
      <div className={styles.footer}>
        <div className={styles.footerItem} />
        <div className={styles.footerItem} />
      </div>
    </div>
  );
}
