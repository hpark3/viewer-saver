import { useRef, useState, type ReactNode } from 'react';

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  theme?: 'light' | 'dark' | 'pastel';
};

const Tooltip = ({ children, content, side = 'top', align = 'center', theme = 'light' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const pointerDownRef = useRef(false);

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
    <div
      className="relative flex items-center focus-within:z-[60] hover:z-[60]"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onPointerDownCapture={() => {
        pointerDownRef.current = true;
        setIsVisible(false);
      }}
      onPointerUpCapture={() => {
        pointerDownRef.current = false;
      }}
      onPointerCancelCapture={() => {
        pointerDownRef.current = false;
      }}
      onFocusCapture={() => {
        if (!pointerDownRef.current) {
          setIsVisible(true);
        }
      }}
      onBlurCapture={() => {
        setIsVisible(false);
      }}
    >
      {children}
      <div
        className={`pointer-events-none absolute ${positionClassName} ${themeClassName} z-[60] whitespace-nowrap transition-[opacity,transform] duration-200 tooltip-shell ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="block leading-none">{content}</span>
        <div className={`absolute ${arrowClassName}`} />
      </div>
    </div>
  );
};

export default Tooltip;
