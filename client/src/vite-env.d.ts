/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL бэкенда, например https://api.example.com */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
