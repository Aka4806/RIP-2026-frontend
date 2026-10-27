import { expect, test } from '@playwright/test'

test('two guest pages, four menu items, local resources and SPA navigation', async ({ page }) => {
  const errors: string[] = []
  const external: string[] = []
  const backend: string[] = []
  let documents = 0
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin !== 'http://127.0.0.1:3000') external.push(url.href)
    if (url.pathname.startsWith('/api/') || ['fetch', 'xhr'].includes(request.resourceType()))
      backend.push(url.href)
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++
  })
  await page.goto('/')
  await expect(page).toHaveURL(/\/indexes$/)
  await expect(page.getByRole('heading', { name: 'Индексы', exact: true })).toBeVisible()
  await expect(page.locator('.index-card')).toHaveCount(9)
  const nav = page.getByRole('navigation', { name: 'Основная навигация' })
  await expect(nav.locator('.nav-item')).toHaveCount(4)
  await expect(nav.getByRole('button', { name: 'Добавление' })).toBeDisabled()
  await expect(nav.getByRole('button', { name: 'Войти' })).toBeDisabled()
  await nav.getByRole('link', { name: 'Лента' }).click()
  await expect(page).toHaveURL(/\/feed\/1$/)
  await expect(page.getByRole('heading', { name: 'B-tree 100K', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Лента' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: 'Плитка' }).click()
  await expect(page.locator('.index-card')).toHaveCount(9)
  expect(documents).toBe(1)
  expect(external).toEqual([])
  expect(backend).toEqual([])
  expect(errors).toEqual([])
})

test('size and name filters pass a consistent list to the feed and wrap around', async ({
  page,
}) => {
  await page.goto('/indexes')
  const slider = page.getByRole('slider', { name: 'Размер таблицы' })
  await slider.focus()
  await slider.press('Home')
  await slider.press('ArrowRight')
  await slider.press('ArrowRight')
  await page.getByRole('button', { name: 'Применить' }).click()
  await expect(page.locator('.index-card')).toHaveCount(3)
  await expect(page.getByText('Найдено: 3')).toBeVisible()
  await page.getByRole('link', { name: 'Открыть Hash 1M в ленте' }).click()
  await expect(page).toHaveURL(/\/feed\/5$/)
  await page.getByRole('link', { name: 'Следующая конфигурация' }).click()
  await expect(page).toHaveURL(/\/feed\/6$/)
  await page.getByRole('link', { name: 'Следующая конфигурация' }).click()
  await expect(page).toHaveURL(/\/feed\/4$/)
  await page.getByRole('link', { name: 'Следующая конфигурация' }).click()
  await expect(page).toHaveURL(/\/feed\/5$/)
  await page.getByRole('link', { name: 'Лента', exact: true }).click()
  await expect(page).toHaveURL(/\/feed\/4$/)
  await page.getByRole('link', { name: 'Плитка' }).click()
  await expect(page.locator('.index-card')).toHaveCount(3)
  await expect(slider).toHaveValue('2')
  await page.getByRole('searchbox', { name: 'Название индекса' }).fill('  hAsH  ')
  await page.getByRole('button', { name: 'Применить' }).click()
  await expect(page.locator('.index-card')).toHaveCount(1)
  await page.getByRole('link', { name: 'Открыть Hash 1M в ленте' }).click()
  await page.getByRole('link', { name: 'Следующая конфигурация' }).click()
  await expect(page).toHaveURL(/\/feed\/5$/)
})

test('empty filter results, recovery and browser history', async ({ page }) => {
  await page.goto('/indexes')
  await page.getByRole('searchbox', { name: 'Название индекса' }).fill('такого индекса нет')
  await page.getByRole('button', { name: 'Применить' }).click()
  await expect(page.getByRole('heading', { name: 'Конфигурации не найдены' })).toBeVisible()
  await expect(page.locator('.index-card')).toHaveCount(0)
  await page.getByRole('link', { name: 'Лента', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'В ленте пока нет карточек' })).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click()
  await expect(page.getByRole('heading', { name: 'B-tree 100K', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Следующая конфигурация' }).click()
  await expect(page).toHaveURL(/\/feed\/2$/)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'B-tree 100K', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Плитка' }).click()
  await expect(page.locator('.index-card')).toHaveCount(9)
})

test('local default image and default video for empty mock fields, also after reload', async ({
  page,
}) => {
  await page.goto('/indexes')
  await expect(page.getByRole('img', { name: 'Схема Hash 10M' })).toHaveAttribute(
    'src',
    '/media/default.png',
  )
  await page.getByRole('link', { name: 'Открыть Hash 10M в ленте' }).click()
  await expect(page.locator('video')).toHaveAttribute('src', '/media/default.mp4')
  await expect(page.getByRole('img', { name: 'Схема Hash 10M' })).toHaveAttribute(
    'src',
    '/media/default.png',
  )
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hash 10M', exact: true })).toBeVisible()
  await expect(page.locator('video')).toHaveAttribute('src', '/media/default.mp4')
  await expect
    .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.readyState))
    .toBeGreaterThanOrEqual(2)
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Схема Hash 10M' })
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0)
})

test('failed media requests fall back to local assets', async ({ page }) => {
  await page.route('**/media/user/hash_100k.png', (route) => route.abort())
  await page.route('**/media/user/hash_100k.mp4', (route) => route.abort())
  await page.goto('/feed/2')
  await expect(page.getByRole('img', { name: 'Схема Hash 100K' })).toHaveAttribute(
    'src',
    '/media/default.png',
  )
  await expect(page.locator('video')).toHaveAttribute('src', '/media/default.mp4')
})

test('unknown card and inactive routes do not create extra pages', async ({ page }) => {
  await page.goto('/feed/999')
  await expect(page.getByRole('heading', { name: 'Конфигурация не найдена' })).toBeVisible()
  await page.getByRole('link', { name: 'К плитке' }).click()
  for (const path of ['/add', '/login', '/unknown']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/indexes$/)
    await expect(page.locator('.index-card')).toHaveCount(9)
  }
  await page.goto('/feed/not-a-number')
  await expect(page.getByRole('heading', { name: 'Конфигурация не найдена' })).toBeVisible()
})

test('description expansion and playback controls work without leaving the feed', async ({
  page,
}) => {
  await page.goto('/feed/1')
  const description = page.locator('details')
  await description.locator('summary').click()
  await expect(description).toHaveAttribute('open', '')
  await expect(description.locator('.less')).toBeVisible()
  await description.locator('summary').click()
  await expect(description).not.toHaveAttribute('open', '')
  await expect
    .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => !video.paused))
    .toBe(true)
  await page.getByRole('button', { name: 'Приостановить видео' }).click()
  await expect(page.getByRole('button', { name: 'Воспроизвести видео' })).toBeVisible()
  await expect
    .poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(true)
})

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
]) {
  test(`layout and bottom navigation stay within ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/indexes')
    await expect(page.locator('.index-card')).toHaveCount(9)
    const nav = page.getByRole('navigation', { name: 'Основная навигация' })
    const initial = await nav.boundingBox()
    expect(initial).not.toBeNull()
    expect(initial!.y + initial!.height).toBeLessThanOrEqual(viewport.height + 1)
    await page.locator('main').evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    const scrolled = await nav.boundingBox()
    expect(scrolled!.y).toBe(initial!.y)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await nav.getByRole('link', { name: 'Лента' }).click()
    const button = page.getByRole('link', { name: 'Следующая конфигурация' })
    await expect(button).toBeVisible()
    const next = await button.boundingBox()
    const label = await button.locator('span').boundingBox()
    expect(label!.y).toBeGreaterThanOrEqual(next!.y)
    expect(label!.y + label!.height).toBeLessThanOrEqual(next!.y + next!.height)
    expect(label!.x + label!.width).toBeLessThanOrEqual(next!.x + next!.width)
    const caption = await page.locator('.feed-caption').boundingBox()
    expect(next!.y + next!.height).toBeLessThanOrEqual(caption!.y)
  })
}

// Verify the actual uploaded clips are decoded, rather than silently replaced by the demo.
for (const [id, stem] of [
  [1, 'btree_100k'],
  [2, 'hash_100k'],
  [3, 'bitmap_100k'],
  [4, 'btree_1m'],
  [6, 'bitmap_1m'],
  [7, 'btree_10m'],
] as const) {
  test(`uploaded video ${stem} plays locally without MinIO`, async ({ page }) => {
    const remote: string[] = []
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:3000') remote.push(request.url())
    })
    await page.goto(`/feed/${id}`)
    const video = page.locator('video')
    await expect(video).toHaveAttribute('src', `/media/user/${stem}.mp4`)
    await expect
      .poll(() => video.evaluate((node: HTMLVideoElement) => node.readyState))
      .toBeGreaterThanOrEqual(2)
    const metadata = await video.evaluate((node: HTMLVideoElement) => ({
      duration: node.duration,
      width: node.videoWidth,
      height: node.videoHeight,
      error: node.error?.code ?? null,
    }))
    expect(metadata.duration).toBeGreaterThan(18)
    expect(metadata.duration).toBeLessThan(21)
    expect(metadata.height).toBeGreaterThanOrEqual(640)
    expect(metadata.error).toBeNull()
    expect(remote).toEqual([])
  })
}
