# @deepseek-ai/dsh-client-ui-tool-failures

[English](README.md) | 中文

Web Session 工具项：从已经发布的 conversation snapshot 中派生失败的 Tool 调用。当前已加载历史中没有失败时，触发器完全不显示；一旦 Tool result 失败，Session 页头最右侧会显示错误状态点和数量，展开后按时间从新到旧列出失败项，并显示 Tool 名称与结果中的第一条有效文本。

计数规则与 [`dsh-client-ui-tool`](../ui-tool/README.md) 的终态语义一致：`error.code === 'interrupted'` 表示「已停止」而不是「失败」，因此不会计入。Code Dispatch 的嵌套调用会递归遍历并分别计数。若历史窗口截断导致调用头不在已加载范围内，则用 `callId` 作为名称；若结果没有文本，则依次退回结构化错误信息与本地化通用失败文案。

本插件不拥有 Host service、RPC、Session event、store 或手写订阅，只通过框架 `useSession` hook 读取 `ConversationSnapshot.nodes` 与 `hasMore`。当还有更早历史未加载时，展开层会明确提示：当前数字只代表已加载窗口，而不是对不可见历史的全会话总数。Escape 会关闭列表并把焦点还给触发器；在列表外按下指针也会关闭。

## 模型体验

无。本包只是浏览器端对持久 Tool result 的只读投影，不改变 prompt、消息、schema、Tool 执行或结果内容。

#### KV Cache effect

无；它从不组装或发送 provider 请求。

## 已知限制与暂缓事项

- 数量只覆盖已加载的 conversation window。当 `hasMore` 为真时，不会为了页头 UI 专门抓取更早的 Tool failure。
- 每行只摘要第一条非空文本，不复制完整 Tool result card；详细失败内容仍以 transcript 为准。
