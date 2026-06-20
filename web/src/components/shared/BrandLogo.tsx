import Image from 'next/image'
import Link from 'next/link'

type Size = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<Size, { height: number; textClass: string }> = {
  sm: { height: 32, textClass: 'text-base' },
  md: { height: 40, textClass: 'text-lg' },
  lg: { height: 48, textClass: 'text-xl' },
}

interface Props {
  size?: Size
  href?: string
  className?: string
  showText?: boolean
  /**
   * Wraps the logo in a white rounded container — use on dark/colored backgrounds
   * so the logo remains legible regardless of its own color scheme.
   */
  darkBg?: boolean
}

export default function BrandLogo({
  size = 'md',
  href,
  className = '',
  showText = false,
  darkBg = false,
}: Props) {
  const { height, textClass } = SIZE_MAP[size]

  const logoImg = (
    <div className={darkBg ? 'bg-white rounded-lg p-1.5 shrink-0' : 'shrink-0'}>
      <Image
        src="/logo-servis-ponuda.png"
        alt="Servis Ponuda"
        width={200}
        height={height}
        style={{ height, width: 'auto', display: 'block' }}
        priority
      />
    </div>
  )

  const inner = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {logoImg}
      {showText && (
        <span className={`font-bold leading-none ${textClass} ${darkBg ? 'text-white' : 'text-gray-900'}`}>
          Servis Ponuda
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    )
  }

  return inner
}
