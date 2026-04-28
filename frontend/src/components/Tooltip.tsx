import type { ReactNode } from 'react';

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  theme?: 'light' | 'dark' | 'pastel';
};

const Tooltip = ({ children, content, side = 'top', align = 'center', theme = 'light' }: TooltipProps) => {
  const horizontalClassName = align === 'start'
    ? 'left-0'
    : align === 'end'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  const positionClassName = side === 'bottom'
    ? `top-full mt-3 ${horizontalClassName}`
    : `bottom-full mb-3 ${horizontalClassName}`;

  const arrowAnchorClassName = align === 'start'
    ? 'left-4'
    : align === 'end'
      ? 'right-4'
      : 'left-1/2 -translate-x-1/2';

  const themeClassName = theme === 'dark'
    ? 'tooltip-dark'
    : theme === 'pastel'
      ? 'tooltip-pastel'
      : 'tooltip-light';

  const arrowClassName = side === 'bottom'
    ? `bottom-full ${arrowAnchorClassName} tooltip-arrow tooltip-arrow-bottom`
    : `top-full ${arrowAnchorClassName} tooltip-arrow tooltip-arrow-top`;

  return (
    <div className="group relative flex items-center focus-within:z-[60] hover:z-[60]">
      {children}
      <div
        className={`pointer-events-none absolute ${positionClassName} ${themeClassName} z-[60] whitespace-nowrap opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-focus-within:opacity-100 tooltip-shell`}
      >
        <span className="block leading-none">{content}</span>
        <div className={`absolute ${arrowClassName}`} />
      </div>
    </div>
  );
};

export default Tooltip;
