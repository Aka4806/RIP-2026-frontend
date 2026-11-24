import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Badge, Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { IndexImage, DEFAULT_VIDEO } from '../components/IndexImage'
import { useObjectUrl } from '../hooks/useObjectUrl'
import {
  createIndexDraft,
  loadIndexDraft,
  publishIndex,
  setError,
  useAppDispatch,
  useAppSelector,
} from '../store'
import type { IndexConfiguration } from '../types'

export function AddPage() {
  const { draft, error, pending } = useAppSelector((state) => state.indexes)
  const dispatch = useAppDispatch()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    void dispatch(loadIndexDraft()).then((result) => {
      if (active) setReady(loadIndexDraft.fulfilled.match(result))
    })
    return () => {
      active = false
    }
  }, [dispatch])
  if (!ready)
    return (
      <main className="content">
        <h1>Конфигурация индекса</h1>
        {error && (
          <Button
            onClick={() => {
              void dispatch(loadIndexDraft()).then((result) =>
                setReady(loadIndexDraft.fulfilled.match(result)),
              )
            }}
            disabled={pending > 0}
          >
            Повторить загрузку
          </Button>
        )}
      </main>
    )
  return <IndexForm key={draft?.id ?? 'new'} draft={draft} />
}

function IndexForm({ draft }: { draft: IndexConfiguration | null }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState(draft?.name ?? '')
  const [image, setImage] = useState<File>()
  const [video, setVideo] = useState<File>()
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [description, setDescription] = useState(draft?.short_description ?? '')
  const [size, setSize] = useState(draft?.table_size ? String(draft.table_size) : '')
  const [selectivity, setSelectivity] = useState(draft ? String(draft.selectivity) : '0.01')
  const imagePreview = useObjectUrl(image)
  const videoPreview = useObjectUrl(video)
  const imageUrl = imagePreview || draft?.image_url || ''
  const videoUrl = videoPreview || draft?.video_url || DEFAULT_VIDEO

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((image && image.size > 10 * 1024 ** 2) || (video && video.size > 50 * 1024 ** 2)) {
      dispatch(setError('Изображение — до 10 МБ, видео — до 50 МБ.'))
      return
    }
    if (draft) {
      const result = await dispatch(
        publishIndex({
          id: draft.id,
          name: name.trim(),
          short_description: description.trim(),
          table_size: Number(size),
          selectivity: Number(selectivity),
          ...(image ? { image } : {}),
          ...(video ? { video } : {}),
        }),
      )
      if (publishIndex.fulfilled.match(result)) navigate(`/feed/${result.payload.id}`)
    } else if (image && video) {
      await dispatch(createIndexDraft({ name: name.trim(), image, video }))
    }
  }

  return (
    <main className="content index-form">
      <header className="index-form-header">
        <h1>Конфигурация индекса</h1>
        <Badge
          bg={draft ? 'warning' : 'success'}
          text={draft ? 'dark' : undefined}
          className={draft ? undefined : 'publication-badge'}
        >
          {draft ? 'черновик' : 'новая'}
        </Badge>
      </header>
      <Form onSubmit={submit}>
        <div className="index-form-media">
          <Form.Group controlId="index-image">
            <Form.Label>Изображение (до 10 МБ)</Form.Label>
            <IndexImage
              key={imageUrl}
              src={imageUrl}
              alt="Изображение конфигурации"
              className="index-form-image"
            />
            <Form.Control
              ref={imageInput}
              className={draft ? 'visually-hidden' : undefined}
              aria-describedby={draft ? 'image-file-status' : undefined}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              required={!draft}
              onChange={(event) => {
                const file = (event.target as HTMLInputElement).files?.[0]
                if (file) setImage(file)
              }}
            />
            {draft && (
              <div className="saved-media-control">
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => imageInput.current?.click()}
                >
                  Заменить изображение
                </Button>
                <Form.Text id="image-file-status" aria-live="polite">
                  {image ? `Выбран новый файл: ${image.name}` : 'Изображение сохранено'}
                </Form.Text>
              </div>
            )}
          </Form.Group>
          <Form.Group controlId="index-video">
            <Form.Label>Видео (до 50 МБ)</Form.Label>
            <video
              key={videoUrl}
              src={videoUrl}
              className="index-form-video"
              controls
              muted
              playsInline
              preload="auto"
              onError={(event) => {
                if (event.currentTarget.getAttribute('src') !== DEFAULT_VIDEO)
                  event.currentTarget.src = DEFAULT_VIDEO
              }}
            />
            <Form.Control
              ref={videoInput}
              className={draft ? 'visually-hidden' : undefined}
              aria-describedby={draft ? 'video-file-status' : undefined}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,.mov"
              required={!draft}
              onChange={(event) => {
                const file = (event.target as HTMLInputElement).files?.[0]
                if (file) setVideo(file)
              }}
            />
            {draft && (
              <div className="saved-media-control">
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => videoInput.current?.click()}
                >
                  Заменить видео
                </Button>
                <Form.Text id="video-file-status" aria-live="polite">
                  {video ? `Выбран новый файл: ${video.name}` : 'Видео сохранено'}
                </Form.Text>
              </div>
            )}
          </Form.Group>
        </div>
        <Form.Group controlId="index-name-input">
          <Form.Label>Название</Form.Label>
          <Form.Control
            required
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Group>
        {draft && (
          <>
            <Form.Group controlId="description">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="size">
              <Form.Label>Размер таблицы</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={2147483647}
                step={1}
                required
                value={size}
                onChange={(event) => setSize(event.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="selectivity">
              <Form.Label>Селективность</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={1}
                step="any"
                required
                value={selectivity}
                onChange={(event) => setSelectivity(event.target.value)}
              />
            </Form.Group>
          </>
        )}
        <Button
          type="submit"
          variant="success"
          disabled={!name.trim() || (draft ? !description.trim() : !image || !video)}
        >
          {draft ? 'Опубликовать' : 'Далее'}
        </Button>
      </Form>
    </main>
  )
}
