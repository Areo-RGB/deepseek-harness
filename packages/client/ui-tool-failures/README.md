# @deepseek-ai/dsh-client-ui-tool-failures

English | [中文](README.zh.md)

Web Session utility that derives failed Tool calls from the already-published conversation snapshot. The trigger is absent while the loaded history contains no failures. Once a Tool result fails, the right-aligned Session utility shows an error dot and count; opening it lists failures newest-first with the Tool name and the first useful result line.

The counter follows the same terminal-state semantics as [`dsh-client-ui-tool`](../ui-tool/README.md): `error.code === 'interrupted'` is stopped rather than failed, so interrupted calls are excluded. Nested Code Dispatch calls are walked recursively and count independently. A result whose call head fell outside the loaded history window falls back to its `callId`; an empty result body falls back to structured error metadata and then localized generic copy.

The plugin owns no Host service, RPC, Session event, store, or manual subscription. It reads `ConversationSnapshot.nodes` and `hasMore` only through the framework `useSession` hook. When older history remains unloaded, the expanded popover says so explicitly: the visible number is the count for the loaded window, not a claim about unseen history. Escape closes the list and restores trigger focus; a pointer press outside closes it as well.

## Model Experience

None, as this browser-only read projection over durable Tool results does not alter prompts, messages, schemas, tool execution, or result content.

#### KV Cache effect

None; it never assembles or sends a provider request.

## Known Limitations and Deferred Work

- The count covers the loaded conversation window. When `hasMore` is true, older Tool failures are intentionally not fetched merely to populate UI chrome.
- Rows summarize the first non-empty text line rather than duplicating the full Tool result card; the transcript remains the detailed failure surface.
