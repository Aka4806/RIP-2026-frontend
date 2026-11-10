/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlerCredentials {
  /** @example "demo-password" */
  password?: string
  /** @example "student" */
  username?: string
}

export interface HandlerLikeInput {
  /** @example 1 */
  like?: number
}

export interface HandlerPublicationInput {
  /** @example 0.01 */
  selectivity?: number
  /** @example "B-tree for equality and range queries" */
  short_description?: string
  /** @example 1000000 */
  table_size?: number
}

export interface HandlerTokenResponse {
  access_token?: string
  expires_at?: string
  /** @example "Bearer" */
  token_type?: string
  user?: SerializerUser
}

export interface SerializerIndex {
  id?: number
  image_url?: string
  is_liked?: number
  is_owner?: number
  likes_count?: number
  name?: string
  selectivity?: number
  short_description?: string
  table_size?: number
  video_url?: string
}

export interface SerializerUser {
  id?: number
  username?: string
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios'
import axios from 'axios'

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType
  /** request body */
  body?: unknown
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private secure?: boolean
  private format?: ResponseType

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || '/',
    })
    this.secure = secure
    this.format = format
    this.securityWorker = securityWorker
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method)

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem)
    } else {
      return `${formItem}`
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key]
      const propertyContent: any[] = property instanceof Array ? property : [property]

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem))
      }

      return formData
    }, new FormData())
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const responseFormat = format || this.format || undefined

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>)
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body)
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    })
  }
}

/**
 * @title SQL Index API ЛР4
 * @version 4.0
 * @baseUrl /
 * @contact
 *
 * JWT авторизация и Redis blacklist. В Authorize введите Bearer и токен через пробел.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Конфигурации
     * @name GetIndexFeed
     * @summary Лента конфигураций
     * @request GET:/api/feed/{id}
     */
    getIndexFeed: (
      id: string,
      query?: {
        /** Следующая карточка */
        next?: boolean
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerIndex, string>({
        path: `/api/feed/${id}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name ListIndexes
     * @summary Список опубликованных конфигураций
     * @request GET:/api/indexes
     */
    listIndexes: (
      query?: {
        /** Размер таблицы */
        table_size?: number
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerIndex[], string>({
        path: `/api/indexes`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name CreateIndexDraft
     * @summary Создать черновик с изображением и видео
     * @request POST:/api/indexes
     * @secure
     */
    createIndexDraft: (
      data: {
        /** Название */
        name: string
        /**
         * Изображение до 10 МиБ
         * @format binary
         */
        image: File
        /**
         * Видео до 50 МиБ
         * @format binary
         */
        video: File
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerIndex, string>({
        path: `/api/indexes`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name GetIndexDraft
     * @summary Черновик текущего пользователя
     * @request GET:/api/indexes/draft
     * @secure
     */
    getIndexDraft: (params: RequestParams = {}) =>
      this.request<SerializerIndex, string>({
        path: `/api/indexes/draft`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name DeleteIndex
     * @summary Удалить свою конфигурацию
     * @request DELETE:/api/indexes/{id}
     * @secure
     */
    deleteIndex: (id: number, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/indexes/${id}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name LikeIndex
     * @summary Поставить или отменить лайк
     * @request POST:/api/indexes/{id}/likes
     * @secure
     */
    likeIndex: (id: number, like: HandlerLikeInput, params: RequestParams = {}) =>
      this.request<SerializerIndex, string>({
        path: `/api/indexes/${id}/likes`,
        method: 'POST',
        body: like,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Конфигурации
     * @name PublishIndex
     * @summary Опубликовать свой черновик
     * @request PUT:/api/indexes/{id}/publication
     * @secure
     */
    publishIndex: (id: number, publication: HandlerPublicationInput, params: RequestParams = {}) =>
      this.request<SerializerIndex, string>({
        path: `/api/indexes/${id}/publication`,
        method: 'PUT',
        body: publication,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name UsersCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users
     */
    usersCreate: (credentials: HandlerCredentials, params: RequestParams = {}) =>
      this.request<SerializerUser, string>({
        path: `/api/users`,
        method: 'POST',
        body: credentials,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name UsersAuthenticationCreate
     * @summary Аутентификация и получение JWT
     * @request POST:/api/users/authentication
     */
    usersAuthenticationCreate: (credentials: HandlerCredentials, params: RequestParams = {}) =>
      this.request<HandlerTokenResponse, string>({
        path: `/api/users/authentication`,
        method: 'POST',
        body: credentials,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Пользователи
     * @name UsersAuthorizationCreate
     * @summary Деавторизация и отзыв JWT через Redis blacklist
     * @request POST:/api/users/authorization
     * @secure
     */
    usersAuthorizationCreate: (params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/users/authorization`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  }
}
