import { cn } from '../../lib/utils.js';
import wordmarkLight from '../../assets/9gclaw-wordmark-light.png';
import wordmarkDark from '../../assets/9gclaw-wordmark-dark.png';

/** Display the original wordmark artwork while cropping out its square emblem. */
export default function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('brand-wordmark', className)} role="img" aria-label="9GCLAW">
      <img
        className="brand-wordmark-image brand-wordmark-light"
        src={wordmarkLight}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <img
        className="brand-wordmark-image brand-wordmark-dark"
        src={wordmarkDark}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </span>
  );
}
