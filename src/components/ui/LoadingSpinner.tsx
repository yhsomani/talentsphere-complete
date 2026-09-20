import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  fullScreen = false,
  text 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
