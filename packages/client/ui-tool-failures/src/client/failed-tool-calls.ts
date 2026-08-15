import type {
  ConversationNode, ToolCallBlock, ToolResultNode,
} from '@deepseek-ai/dsh-client-runtime/client'

/** Minimal immutable row consumed by the header disclosure. */
export interface FailedToolCall {
  callId: string
  toolName: string
  summary: string
  time: number
  seq: number
}

/** First useful text line in a Tool result, if one exists. */
function firstTextLine(result: ToolResultNode): string {
  for (const block of result.content) {
    if (block.type !== 'text') continue
    for (const line of block.text.split(/\r?\n/u)) {
      const trimmed = line.trim()
      if (trimmed !== '') return trimmed
    }
  }
  return ''
}

/** Stable fallback for results whose model-facing body contains no text. */
function failureSummary(result: ToolResultNode): string {
  const text = firstTextLine(result)
  if (text !== '') return text
  if (result.error) return `${result.error.name}: ${result.error.code}`
  return ''
}

/** Walk one Tool call tree and append real failures in any nesting level. */
function collect(block: ToolCallBlock, rows: FailedToolCall[]): void {
  if ('kind' in block && block.kind === 'tool-result') {
    if (block.isError && block.error?.code !== 'interrupted') {
      rows.push({
        callId: block.callId,
        toolName: block.call?.name ?? block.callId,
        summary: failureSummary(block),
        time: block.time,
        seq: block.seq,
      })
    }
  }
  for (const child of block.subCalls) collect(child, rows)
}

/**
 * Collect failed Tool calls from the loaded conversation window.
 * Interrupted calls intentionally do not count: ui-tool presents them as stopped.
 */
export function failedToolCalls(nodes: readonly ConversationNode[]): FailedToolCall[] {
  const rows: FailedToolCall[] = []
  for (const node of nodes) {
    if (node.kind === 'tool-result') collect(node, rows)
  }
  return rows.sort((left, right) => (right.time - left.time) || (right.seq - left.seq))
}
