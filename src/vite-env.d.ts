/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BUILD_TYPE: string
  readonly VITE_APP_URL: string
  readonly VITE_LANDING_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
