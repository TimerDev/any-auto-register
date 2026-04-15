import {
  CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY,
  CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
  type ChatGPTRegistrationMode,
} from '@/lib/chatgptRegistrationMode'

type RegistrationExtra = Record<string, unknown>

export interface ChatGPTRegistrationRequestAdapter {
  readonly mode: ChatGPTRegistrationMode
  extendExtra(extra: RegistrationExtra): RegistrationExtra
}

class RefreshTokenChatGPTRegistrationRequestAdapter
  implements ChatGPTRegistrationRequestAdapter
{
  readonly mode = CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN

  constructor(private useCodex: boolean = true) {}

  extendExtra(extra: RegistrationExtra): RegistrationExtra {
    return {
      ...extra,
      chatgpt_registration_mode: this.mode,
      chatgpt_has_refresh_token_solution: true,
      chatgpt_use_codex: this.useCodex,
    }
  }
}

class AccessTokenOnlyChatGPTRegistrationRequestAdapter
  implements ChatGPTRegistrationRequestAdapter
{
  readonly mode = CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY

  constructor(private useCodex: boolean = true) {}

  extendExtra(extra: RegistrationExtra): RegistrationExtra {
    return {
      ...extra,
      chatgpt_registration_mode: this.mode,
      chatgpt_has_refresh_token_solution: false,
      chatgpt_use_codex: this.useCodex,
    }
  }
}

export function buildChatGPTRegistrationRequestAdapter(
  platform: string | undefined,
  mode: ChatGPTRegistrationMode,
  useCodex: boolean = true,
): ChatGPTRegistrationRequestAdapter | null {
  if (platform !== 'chatgpt') return null

  if (mode === CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY) {
    return new AccessTokenOnlyChatGPTRegistrationRequestAdapter(useCodex)
  }

  return new RefreshTokenChatGPTRegistrationRequestAdapter()
}
