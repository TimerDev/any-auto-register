import { Space, Switch, Tag, Typography } from 'antd'

import {
  CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY,
  CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
  type ChatGPTRegistrationMode,
} from '@/lib/chatgptRegistrationMode'

const { Text } = Typography

type ChatGPTRegistrationModeSwitchProps = {
  mode: ChatGPTRegistrationMode
  onChange: (mode: ChatGPTRegistrationMode) => void
}

export function ChatGPTRegistrationModeSwitch({
  mode,
  onChange,
}: ChatGPTRegistrationModeSwitchProps) {
  const hasRefreshTokenSolution =
    mode === CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN

  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space align="center" wrap>
        <Switch
          checked={hasRefreshTokenSolution}
          checkedChildren="有 RT"
          unCheckedChildren="无 RT"
          onChange={(checked) =>
            onChange(
              checked
                ? CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN
                : CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY,
            )
          }
        />
        <Tag color={hasRefreshTokenSolution ? 'success' : 'default'}>
          {hasRefreshTokenSolution ? '默认推荐' : '兼容旧方案'}
        </Tag>
      </Space>
      <Text type="secondary">
        {hasRefreshTokenSolution
          ? '有 RT 方案会走新 PR 链路，产出 Access Token + Refresh Token。'
          : '无 RT 方案会走当前旧链路，只产出 Access Token / Session，依赖 RT 的能力可能不可用。'}
      </Text>
    </Space>
  )
}

// 新增Codex模式开关组件
type ChatGPTCodexModeSwitchProps = {
  useCodex: boolean
  onChange: (useCodex: boolean) => void
}

export function ChatGPTCodexModeSwitch({
  useCodex,
  onChange,
}: ChatGPTCodexModeSwitchProps) {
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space align="center" wrap>
        <Switch
          checked={useCodex}
          checkedChildren="Codex CLI"
          unCheckedChildren="ChatGPT Web"
          onChange={onChange}
        />
        <Tag color={useCodex ? 'warning' : 'success'}>
          {useCodex ? '可能需手机号' : '无需手机号'}
        </Tag>
      </Space>
      <Text type="secondary">
        {useCodex
          ? '注册 OpenAI Codex CLI 专用账号，使用专用 OAuth 流程，可能需要手机号验证。'
          : '注册普通 ChatGPT Web 账号，使用标准注册流程，无需手机号验证。'}
      </Text>
    </Space>
  )
}
