import { useState } from 'react'
import { Image } from 'react-bootstrap'
export const DEFAULT_IMAGE = '/media/default.png'
export const DEFAULT_VIDEO = '/media/default.mp4'
interface Props {
  src: string
  alt: string
  className?: string
}
export function IndexImage({ src, alt, className }: Props) {
  const candidate = src.trim() || DEFAULT_IMAGE
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const resolved = failedSource === candidate ? DEFAULT_IMAGE : candidate
  return (
    <Image
      src={resolved}
      alt={alt}
      className={className}
      onError={() => {
        if (resolved !== DEFAULT_IMAGE) setFailedSource(candidate)
      }}
    />
  )
}
