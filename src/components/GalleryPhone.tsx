const IMG_W = 900
const IMG_H = 1600

export function GalleryPhone({
  jpg,
  webp,
  label,
  priority,
}: {
  jpg: string
  webp: string
  label: string
  priority?: boolean
}) {
  return (
    <div className="gallery-phone">
      <span className="gallery-phone-btn action" aria-hidden="true" />
      <span className="gallery-phone-btn vol-up" aria-hidden="true" />
      <span className="gallery-phone-btn vol-down" aria-hidden="true" />
      <span className="gallery-phone-btn power" aria-hidden="true" />
      <div className="gallery-phone-bezel">
        <div className="gallery-phone-island" aria-hidden="true">
          <span className="gallery-phone-cam" />
        </div>
        <div className="gallery-phone-screen">
          <picture>
            <source type="image/webp" srcSet={`${webp} 2x`} />
            <img
              src={jpg}
              alt={label}
              width={IMG_W}
              height={IMG_H}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </picture>
        </div>
      </div>
    </div>
  )
}
