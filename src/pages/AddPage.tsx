import { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  createIndexDraft,
  deleteIndex,
  loadIndexDraft,
  publishIndex,
  useAppDispatch,
  useAppSelector,
} from '../store'
export function AddPage() {
  const draft = useAppSelector((s) => s.indexes.draft)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [image, setImage] = useState<File>()
  const [video, setVideo] = useState<File>()
  const [description, setDescription] = useState('')
  const [size, setSize] = useState(100000)
  const [selectivity, setSelectivity] = useState(0.01)
  useEffect(() => {
    void dispatch(loadIndexDraft())
  }, [dispatch])
  useEffect(() => {
    if (draft) {
      setDescription(draft.short_description)
      setSize(draft.table_size || 100000)
      setSelectivity(draft.selectivity)
    }
  }, [draft])
  return (
    <main className="content">
      <h1>{draft ? 'Публикация' : 'Добавление'}</h1>
      {!draft ? (
        <Form key={draft ? 'publication' : 'creation'}
          onSubmit={(event) => {
            event.preventDefault()
            if (image && video) void dispatch(createIndexDraft({ name: name.trim(), image, video }))
          }}
        >
          <Form.Group controlId="new-name">
            <Form.Label>Название</Form.Label>
            <Form.Control
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="new-image">
            <Form.Label>Изображение (до 10 МБ)</Form.Label>
            <Form.Control
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              required
              onChange={(e) => setImage((e.target as HTMLInputElement).files?.[0])}
            />
          </Form.Group>
          <Form.Group controlId="new-video">
            <Form.Label>Видео (до 50 МБ)</Form.Label>
            <Form.Control
              type="file"
              accept="video/mp4,video/quicktime,video/webm,.mov"
              required
              onChange={(e) => setVideo((e.target as HTMLInputElement).files?.[0])}
            />
          </Form.Group>
          <Button
            type="submit"
            variant="success"
            disabled={
              !name.trim() ||
              !image ||
              !video ||
              image.size > 10 * 1024 * 1024 ||
              video.size > 50 * 1024 * 1024
            }
          >
            Создать черновик
          </Button>
        </Form>
      ) : (
        <Form key={draft ? 'publication' : 'creation'}
          onSubmit={async (event) => {
            event.preventDefault()
            const result = await dispatch(
              publishIndex({
                id: draft.id,
                short_description: description.trim(),
                table_size: size,
                selectivity,
              }),
            )
            if (publishIndex.fulfilled.match(result)) navigate(`/feed/${result.payload.id}`)
          }}
        >
          <h2>{draft.name}</h2>
          <Form.Group controlId="description">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              required
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setSize(Number(e.target.value))}
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
              onChange={(e) => setSelectivity(Number(e.target.value))}
            />
          </Form.Group>
          <Button type="submit" variant="success" disabled={!description.trim()}>
            Опубликовать
          </Button>{' '}
          <Button
            variant="outline-danger"
            onClick={() => {
              if (window.confirm('Удалить черновик?')) void dispatch(deleteIndex(draft.id))
            }}
          >
            Удалить черновик
          </Button>
        </Form>
      )}
    </main>
  )
}
