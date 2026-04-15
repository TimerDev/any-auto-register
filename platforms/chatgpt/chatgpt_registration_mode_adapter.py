"""ChatGPT 注册模式适配器。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Callable, Optional

from core.base_platform import Account, AccountStatus

CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN = "refresh_token"
CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY = "access_token_only"
DEFAULT_CHATGPT_REGISTRATION_MODE = CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN

# OAuth Client IDs
CHATGPT_CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann"  # Codex CLI
CHATGPT_WEB_CLIENT_ID = "pdlLIX2Y72MIl2rhLhTE9VV9bN905kBh"  # ChatGPT Web (可能需要更新)


def normalize_chatgpt_registration_mode(value) -> str:
    normalized = str(value or "").strip().lower().replace("-", "_")
    if normalized in {
        CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY,
        "access_token",
        "at_only",
        "without_rt",
        "without_refresh_token",
        "no_rt",
        "0",
        "false",
    }:
        return CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY
    if normalized in {
        CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
        "rt",
        "with_rt",
        "has_rt",
        "1",
        "true",
    }:
        return CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN
    return DEFAULT_CHATGPT_REGISTRATION_MODE


def resolve_chatgpt_registration_mode(extra: Optional[dict]) -> str:
    extra = extra or {}
    if "chatgpt_registration_mode" in extra:
        return normalize_chatgpt_registration_mode(extra.get("chatgpt_registration_mode"))
    if "chatgpt_has_refresh_token_solution" in extra:
        return (
            CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN
            if bool(extra.get("chatgpt_has_refresh_token_solution"))
            else CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY
        )
    return DEFAULT_CHATGPT_REGISTRATION_MODE


def resolve_chatgpt_client_id(extra: Optional[dict]) -> str:
    """解析ChatGPT注册时使用的OAuth client_id"""
    extra = extra or {}
    use_codex = extra.get("chatgpt_use_codex", True)  # 默认使用Codex模式保持兼容性

    # 标准化布尔值解析
    if isinstance(use_codex, str):
        use_codex = use_codex.lower() in ("true", "1", "yes", "on", "codex")
    elif isinstance(use_codex, int):
        use_codex = bool(use_codex)

    return CHATGPT_CODEX_CLIENT_ID if use_codex else CHATGPT_WEB_CLIENT_ID


@dataclass(frozen=True)
class ChatGPTRegistrationContext:
    email_service: object
    proxy_url: Optional[str]
    callback_logger: Callable[[str], None]
    email: Optional[str]
    password: Optional[str]
    browser_mode: str
    max_retries: int
    extra_config: dict


class BaseChatGPTRegistrationModeAdapter(ABC):
    mode: str

    @abstractmethod
    def _create_engine(self, context: ChatGPTRegistrationContext):
        """按模式构造底层注册引擎。"""

    def run(self, context: ChatGPTRegistrationContext):
        # 在运行前处理配置，确保包含正确的client_id
        processed_config = dict(context.extra_config)
        processed_config["oauth_client_id"] = resolve_chatgpt_client_id(context.extra_config)

        processed_context = ChatGPTRegistrationContext(
            email_service=context.email_service,
            proxy_url=context.proxy_url,
            callback_logger=context.callback_logger,
            email=context.email,
            password=context.password,
            browser_mode=context.browser_mode,
            max_retries=context.max_retries,
            extra_config=processed_config,
        )

        _MAILBOX_ERROR_MARKERS = ("service_abuse_mode", "oauth_token_failed")
        _MAX_ATTEMPTS = 3
        result = None
        for _attempt in range(_MAX_ATTEMPTS):
            engine = self._create_engine(processed_context)
            if processed_context.email is not None:
                engine.email = processed_context.email
            if processed_context.password is not None:
                engine.password = processed_context.password
            result = engine.run()
            if result.success:
                return result
            err = str(getattr(result, "error_message", "") or "")
            matched_marker = next((m for m in _MAILBOX_ERROR_MARKERS if m in err), None)
            if matched_marker and _attempt < _MAX_ATTEMPTS - 1:
                processed_context.callback_logger(
                    f"邮箱 OAuth token 已失效（{matched_marker}），"
                    f"换用下一个邮箱重试 ({_attempt + 1}/{_MAX_ATTEMPTS - 1})..."
                )
                continue
            break
        return result

    def build_account(self, result, fallback_password: str) -> Account:
        return Account(
            platform="chatgpt",
            email=getattr(result, "email", ""),
            password=getattr(result, "password", "") or fallback_password,
            user_id=getattr(result, "account_id", ""),
            token=getattr(result, "access_token", ""),
            status=AccountStatus.REGISTERED,
            extra=self._build_account_extra(result),
        )

    def _build_account_extra(self, result) -> dict:
        return {
            "access_token": getattr(result, "access_token", ""),
            "refresh_token": getattr(result, "refresh_token", ""),
            "id_token": getattr(result, "id_token", ""),
            "session_token": getattr(result, "session_token", ""),
            "workspace_id": getattr(result, "workspace_id", ""),
            "chatgpt_registration_mode": self.mode,
            "chatgpt_has_refresh_token_solution": self.mode == CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN,
            "chatgpt_token_source": getattr(result, "source", "register"),
        }


class RefreshTokenChatGPTRegistrationAdapter(BaseChatGPTRegistrationModeAdapter):
    mode = CHATGPT_REGISTRATION_MODE_REFRESH_TOKEN

    def _create_engine(self, context: ChatGPTRegistrationContext):
        from platforms.chatgpt.refresh_token_registration_engine import RefreshTokenRegistrationEngine

        return RefreshTokenRegistrationEngine(
            email_service=context.email_service,
            proxy_url=context.proxy_url,
            callback_logger=context.callback_logger,
            browser_mode=context.browser_mode,
            max_retries=context.max_retries,
            extra_config=context.extra_config,
        )


class AccessTokenOnlyChatGPTRegistrationAdapter(BaseChatGPTRegistrationModeAdapter):
    mode = CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY

    def _create_engine(self, context: ChatGPTRegistrationContext):
        from platforms.chatgpt.access_token_only_registration_engine import AccessTokenOnlyRegistrationEngine

        return AccessTokenOnlyRegistrationEngine(
            email_service=context.email_service,
            proxy_url=context.proxy_url,
            browser_mode=context.browser_mode,
            callback_logger=context.callback_logger,
            max_retries=context.max_retries,
            extra_config=context.extra_config,
        )


def build_chatgpt_registration_mode_adapter(
    extra: Optional[dict],
) -> BaseChatGPTRegistrationModeAdapter:
    mode = resolve_chatgpt_registration_mode(extra)
    if mode == CHATGPT_REGISTRATION_MODE_ACCESS_TOKEN_ONLY:
        return AccessTokenOnlyChatGPTRegistrationAdapter()
    return RefreshTokenChatGPTRegistrationAdapter()
