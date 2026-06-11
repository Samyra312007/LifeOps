/// <reference types="vite/client" />

interface PlaidHandler {
  open: () => void;
  exit: () => void;
  destroy: () => void;
}

interface PlaidConfig {
  token: string;
  onSuccess: (public_token: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  onEvent?: (eventName: string, metadata: any) => void;
}

interface PlaidStatic {
  create: (config: PlaidConfig) => PlaidHandler;
}

interface Window {
  Plaid: PlaidStatic;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_FIT_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
