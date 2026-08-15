/** Dictionary namespace owned by the failed-Tool counter plugin. */
export const NS = 'tool-failure'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'count.one': '{count} 个工具调用失败',
  'count.other': '{count} 个工具调用失败',
  'list.aria': '失败的工具调用',
  'history.partial': '仅统计当前已加载的历史记录；更早的记录尚未加载。',
  'failure.unknown': '工具调用失败',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<ToolFailureKey, string> = {
  'count.one': '{count} failed tool call',
  'count.other': '{count} failed tool calls',
  'list.aria': 'Failed tool calls',
  'history.partial': 'Only loaded history is counted; older history is not loaded.',
  'failure.unknown': 'Tool call failed',
}

/** Key domain of the namespace (Chinese is the source of truth). */
export type ToolFailureKey = keyof typeof zh
