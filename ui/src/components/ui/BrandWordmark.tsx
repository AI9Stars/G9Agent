import { useTranslation } from 'react-i18next';
import { productName } from '../../../../apps/desktop/src/brand';
import { cn } from '../../lib/utils.js';

/** Live text follows language changes without baking a language into artwork. */
export default function BrandWordmark({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const name = productName(i18n.resolvedLanguage || i18n.language);
  return (
    <span className={cn('brand-wordmark', className)} role="img" aria-label={name}>
      <img
        className="brand-wordmark-mark"
        src="/logo-256.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <span aria-hidden="true">{name}</span>
    </span>
  );
}
