import { useEffect, useState } from 'react'

import {
  CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
  loadChatGPTRegistrationMode,
  saveChatGPTRegistrationMode,
  loadChatGPTUseCodex,
  saveChatGPTUseCodex,
  type ChatGPTRegistrationMode,
} from '@/lib/chatgptRegistrationMode'

export function usePersistentChatGPTRegistrationMode() {
  const [mode, setMode] = useState<ChatGPTRegistrationMode>(() =>
    loadChatGPTRegistrationMode(),
  )

  useEffect(() => {
    saveChatGPTRegistrationMode(mode)
  }, [mode])

  return {
    mode,
    setMode,
    hasRefreshTokenSolution:
      mode === CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
  }
}

// 新增Codex模式hook
export function usePersistentChatGPTCodexMode() {
  const [useCodex, setUseCodex] = useState<boolean>(() =>
    loadChatGPTUseCodex(),
  )

  useEffect(() => {
    saveChatGPTUseCodex(useCodex)
  }, [useCodex])

  return {
    useCodex,
    setUseCodex,
  }
}
