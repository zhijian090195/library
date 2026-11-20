import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 封面：傳字串視為圖片網址，也可以直接傳元素 */
  cover?: ReactNode;
  coverAlt?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  /** 整張可點擊，hover 時浮起 */
  interactive?: boolean;
  /** 只有外框、沒有陰影 */
  outline?: boolean;
  /** 圖片在左的橫向排列 */
  horizontal?: boolean;
  /** 有 href 時整張卡片渲染成 <a> */
  href?: string;
  target?: string;
  rel?: string;
}

const CardMedia = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => <div className={cx('a-card__media', className)} {...rest} />;
const CardBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => <div className={cx('a-card__body', className)} {...rest} />;
const CardFooter = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => <div className={cx('a-card__footer', className)} {...rest} />;

const CardRoot = forwardRef<HTMLElement, CardProps>(function Card(
  { cover, coverAlt = '', eyebrow, title, footer, interactive, outline, horizontal, href, className, children, ...rest }, ref
) {
  const Comp = (href ? 'a' : 'article') as ElementType;
  const hasBody = eyebrow != null || title != null || children != null;
  return (
    <Comp
      ref={ref as never}
      href={href}
      className={cx('a-card', (interactive || href) && 'a-card--interactive', outline && 'a-card--outline', horizontal && 'a-card--horizontal', className)}
      {...rest}
    >
      {cover != null && <CardMedia>{typeof cover === 'string' ? <img src={cover} alt={coverAlt} /> : cover}</CardMedia>}
      {hasBody && (
        <CardBody>
          {eyebrow != null && <span className="a-card__eyebrow">{eyebrow}</span>}
          {title != null && <h3 className="a-card__title">{title}</h3>}
          {typeof children === 'string' ? <p className="a-card__text">{children}</p> : children}
        </CardBody>
      )}
      {footer != null && <CardFooter>{footer}</CardFooter>}
    </Comp>
  );
});

/** 卡片。可用 props（cover/title/footer）或子元件 Card.Media / Card.Body / Card.Footer 自由組合 */
export const Card = Object.assign(CardRoot, { Media: CardMedia, Body: CardBody, Footer: CardFooter });
