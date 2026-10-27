import { useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { DEFAULT_IMAGE, DEFAULT_VIDEO, IndexImage } from './IndexImage'
import { Icon } from './Icon'
import type { IndexConfiguration } from '../types'
export function FeedMedia({ item }: { item: IndexConfiguration }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [paused, setPaused] = useState(false)
  const candidate = item.video_url.trim() || DEFAULT_VIDEO
  const resolved = failedSource === candidate ? DEFAULT_VIDEO : candidate
  function togglePlayback() {
    if (!video.current) return
    if (video.current.paused) void video.current.play().catch(() => setPaused(true))
    else video.current.pause()
  }
  return (
    <>
      <IndexImage src={item.image_url} alt={`Схема ${item.name}`} className="feed-poster" />
      {!unavailable && (
        <video
          ref={video}
          className="feed-video"
          src={resolved}
          poster={item.image_url.trim() || DEFAULT_IMAGE}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Анимация ${item.name}`}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onError={() => {
            if (resolved !== DEFAULT_VIDEO) setFailedSource(candidate)
            else setUnavailable(true)
          }}
        />
      )}
      <div className="feed-shade" />
      {!unavailable && (
        <Button
          variant="light"
          className="media-toggle"
          onClick={togglePlayback}
          aria-label={paused ? 'Воспроизвести видео' : 'Приостановить видео'}
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </Button>
      )}
    </>
  )
}
