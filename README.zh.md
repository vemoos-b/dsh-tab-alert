# dsh-tab-alert

> DSH Web 标签页提醒：代理回合结束时若浏览器标签页不在前台，标题闪烁 "New Message!"，回到标签页即停止。
>
> [English](README.md)

## 行为

- 代理回合**运行中**：无任何表现。
- 回合**结束**且标签页**不在前台**：标题每秒在 `New Message!` 与原标题之间交替闪烁。
- 用户回到标签页（visibilitychange）：闪烁立即停止，标题恢复原状。
- 回合在标签页可见时结束：不闪烁（用户已经看到了）。

## 检测原理

优先使用宿主客户端服务（与官方 `@deepseek-ai/dsh-client-ui-conversation` 相同契约）：

```text
ctx.sessions.list.getSnapshot().byId[mainViewSessionId].running
```

`mainViewSessionId` 通过 `retainedBy.mainView > 0` 解析当前主视图会话；`sessions.list` 变化时即时回调，另有 2s 轮询兜底。若服务不可用或记录无 `running` 字段，回退到 DOM 检测 `[data-chat-flow-kind="turn-process"]`（dsh-auto-collapse 契约）。

## 安装

```bash
dsh plugin add dsh-tab-alert        # 从 npm 安装
# 或从 GitHub：
dsh plugin add github:vemoos-b/dsh-tab-alert
```

在「设置 → 插件」中开启 dsh-tab-alert，刷新 Web 界面即可。

## 兼容性

DSH 0.2.0-rc.2（Web 客户端）。MIT 许可证。
