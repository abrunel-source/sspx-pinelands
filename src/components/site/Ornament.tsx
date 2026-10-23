// Decorative ornaments from the design: gold cross dividers and the two hearts.

export const Divider = ({ light = false, className = 'divider' }: { light?: boolean; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={light ? '/ornaments/divider-light.svg' : '/ornaments/divider-gold.svg'}
    alt=""
    aria-hidden="true"
    width={220}
    height={24}
    className={className}
  />
)

export const Hearts = ({ gold = false, size = 44 }: { gold?: boolean; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={gold ? '/brand/two-hearts-gold.svg' : '/brand/two-hearts-red.svg'}
    alt=""
    aria-hidden="true"
    width={size}
    height={Math.round(size * 1.34)}
    className="hearts"
  />
)

export const RoseWindow = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/ornaments/rose-window.svg" alt="" aria-hidden="true" className="rose-window" width={760} height={760} />
)
