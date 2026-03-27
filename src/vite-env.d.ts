/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_BLOCKED_EMAIL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
