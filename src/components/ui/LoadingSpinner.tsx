import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  fullScreen = false, 
  text 
}: LoadingSpinnerProps) {
  const normalizedSize = 
    size === 'sm' || size === 'small' ? 'small' :
    size === 'lg' || size === 'large' ? 'large' : 'medium';

  const spinner = (
    <div className={`${styles.container} ${styles[normalizedSize]}`}>
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
