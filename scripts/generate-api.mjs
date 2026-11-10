import { generateApi } from 'swagger-typescript-api'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
const schema = JSON.parse(readFileSync(resolve('scripts/swagger.json'), 'utf8'))
const names = {
  '/api/indexes': { get: 'listIndexes', post: 'createIndexDraft' },
  '/api/indexes/draft': { get: 'getIndexDraft' },
  '/api/indexes/{id}': { delete: 'deleteIndex' },
  '/api/indexes/{id}/publication': { put: 'publishIndex' },
  '/api/indexes/{id}/likes': { post: 'likeIndex' },
  '/api/feed/{id}': { get: 'getIndexFeed' },
}
for (const [path, methods] of Object.entries(names)) {
  for (const [method, name] of Object.entries(methods))
    schema.paths[path][method].operationId = name
}
// The backend accepts an empty feed ID as well as a numeric ID.
schema.paths['/api/feed/{id}'].get.parameters[0].type = 'string'
await generateApi({
  name: 'Api.ts',
  output: resolve('src/api'),
  spec: schema,
  httpClientType: 'axios',
})
