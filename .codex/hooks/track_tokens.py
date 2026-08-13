import json
import os
import subprocess
import sys
from pathlib import Path


def read_turn_usage(transcript_path: Path, turn_id: str) -> tuple[dict[str, int], int, int, int]:
    """Return summed model usage and the latest context-window size for one turn."""
    totals = {
        "input_tokens": 0,
        "cached_input_tokens": 0,
        "output_tokens": 0,
        "reasoning_output_tokens": 0,
        "total_tokens": 0,
    }
    context_window = 0
    latest_input_tokens = 0
    model_calls = 0
    in_target_turn = False

    with transcript_path.open("r", encoding="utf-8") as transcript:
        for line in transcript:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue

            if record.get("type") != "event_msg":
                continue

            payload = record.get("payload", {})
            event_type = payload.get("type")

            if event_type == "task_started":
                in_target_turn = payload.get("turn_id") == turn_id
                continue

            if not in_target_turn:
                continue

            if event_type == "task_complete" and payload.get("turn_id") == turn_id:
                break

            if event_type != "token_count":
                continue

            model_calls += 1
            info = payload.get("info") or {}
            usage = info.get("last_token_usage") or {}
            for key in totals:
                totals[key] += int(usage.get(key, 0) or 0)
            latest_input_tokens = int(usage.get("input_tokens", 0) or 0)
            context_window = int(info.get("model_context_window", context_window) or context_window)

    return totals, context_window, latest_input_tokens, model_calls


def show_windows_notification(message: str) -> None:
    """Show a best-effort Windows toast without affecting the hook response."""
    if sys.platform != "win32":
        return

    script = r"""
$ErrorActionPreference = 'Stop'
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
[Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null

$template = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($template)
$text = $xml.GetElementsByTagName('text')
$text.Item(0).AppendChild($xml.CreateTextNode($env:CODEX_TOAST_TITLE)) > $null
$text.Item(1).AppendChild($xml.CreateTextNode($env:CODEX_TOAST_MESSAGE)) > $null

$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Codex').Show($toast)
"""
    environment = os.environ.copy()
    environment["CODEX_TOAST_TITLE"] = "Codex turn complete"
    environment["CODEX_TOAST_MESSAGE"] = message

    try:
        subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            check=False,
            capture_output=True,
            env=environment,
            timeout=5,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    except (OSError, subprocess.SubprocessError):
        pass


def main() -> int:
    hook_input = json.load(sys.stdin)
    turn_id = hook_input.get("turn_id", "")
    transcript_value = hook_input.get("transcript_path")
    response: dict[str, object] = {"continue": True}

    if not turn_id or not transcript_value:
        message = "Tokens used (last turn): unavailable | Context used: unavailable"
        response["systemMessage"] = message
        show_windows_notification(message)
        print(json.dumps(response))
        return 0

    transcript_path = Path(transcript_value)
    if not transcript_path.is_file():
        message = "Tokens used (last turn): unavailable | Context used: unavailable"
        response["systemMessage"] = message
        show_windows_notification(message)
        print(json.dumps(response))
        return 0

    usage, context_window, latest_input_tokens, model_calls = read_turn_usage(
        transcript_path, turn_id
    )
    input_tokens = usage["input_tokens"]
    output_tokens = usage["output_tokens"]
    cached_tokens = usage["cached_input_tokens"]
    uncached_input_tokens = max(input_tokens - cached_tokens, 0)
    call_label = "model call" if model_calls == 1 else "model calls"

    if context_window:
        context_percent = latest_input_tokens / context_window * 100
        context_text = f"{latest_input_tokens:,}/{context_window:,} ({context_percent:.1f}%)"
    else:
        context_text = f"{latest_input_tokens:,} input tokens"

    message = (
        f"Turn: {model_calls:,} {call_label}\n"
        f"Input: {uncached_input_tokens:,} uncached + {cached_tokens:,} cached | "
        f"Output: {output_tokens:,}\n"
        f"Context: {context_text}"
    )
    response["systemMessage"] = message
    show_windows_notification(message)
    print(json.dumps(response))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
