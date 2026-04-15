export const CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN = 'refresh_token'
export const CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY = 'access_token_only'
export const CHATGPT_REGISTRATION_MODE_STORAGE_KEY = 'chatgpt-registration-mode'

// 新增Codex模式相关常量
export const CHATGPT_USE_CODEX_STORAGE_KEY = 'chatgpt-use-codex'
export const DEFAULT_CHATGPT_USE_CODEX = true

export type ChatGPTRegistrationMode =
  | typeof CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN
  | typeof CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY

export const DEFAULT_CHATGPT_REGISTRATION_MODE: ChatGPTRegistrationMode =
  CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN

export function normalizeChatGPTRegistrationMode(
  value: unknown,
): ChatGPTRegistrationMode {
  if (value === CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY) {
    return CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY
  }
  return DEFAULT_CHATGPT_REGISTRATION_MODE
}

export function loadChatGPTRegistrationMode(): ChatGPTRegistrationMode {
  if (typeof window === 'undefined') {
    return DEFAULT_CHATGPT_REGISTRATION_MODE
  }

  return normalizeChatGPTRegistrationMode(
    window.localStorage.getItem(CHATGPT_REGISTRATION_MODE_STORAGE_KEY),
  )
}

export function saveChatGPTRegistrationMode(
  mode: ChatGPTRegistrationMode,
): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHATGPT_REGISTRATION_MODE_STORAGE_KEY, mode)
}

// 新增Codex模式相关函数
export function loadChatGPTUseCodex(): boolean {
  if (typeof window === 'undefined') {
    return DEFAULT_CHATGPT_USE_CODEX
  }

  const stored = window.localStorage.getItem(CHATGPT_USE_CODEX_STORAGE_KEY)
  if (stored === null) {
    return DEFAULT_CHATGPT_USE_CODEX
  }

  return stored === 'true'
}

export function saveChatGPTUseCodex(useCodex: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHATGPT_USE_CODEX_STORAGE_KEY, String(useCodex))
}
