# dsh-tab-alert

> DSH Web tab alert: when an agent turn finishes while the browser tab is in the background, the tab title flashes "New Message!"; returning to the tab stops it instantly.
>
> [中文](README.zh.md)

## Behavior

- Turn **running**: nothing happens.
- Turn **finished** while the tab is **hidden**: the title alternates between `New Message!` and the original title every second.
- User returns to the tab (visibilitychange): blinking stops immediately, the title is restored.
- Turn finishes while the tab is visible: no blinking (the user already saw it).

## Detection

Primary path uses the host client services (same contract as the official `@deepseek-ai/dsh-client-ui-conversation`):

```text
ctx.sessions.list.getSnapshot().byId[mainViewSessionId].running
```

`mainViewSessionId` resolves the main-view session via `retainedBy.mainView > 0`; `sessions.list` changes trigger an immediate callback plus a 2s polling fallback. If the service is unavailable or the record lacks the `running` field, it falls back to the DOM check `[data-chat-flow-kind="turn-process"]` (the dsh-auto-collapse contract).

## Install

```bash
dsh plugin add dsh-tab-alert        # from npm
# or from GitHub:
dsh plugin add github:vemoos-b/dsh-tab-alert
```

Enable dsh-tab-alert in Settings → Plugins and reload the web UI.

## Compatibility

DSH 0.2.0-rc.2 (web client). MIT license.
