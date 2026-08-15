/** Browser half of the failed-Tool session-header counter. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ToolFailureAction } from './ToolFailureAction.tsx'
import { en, NS, zh, type ToolFailureKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Failed Tool call counter copy. */
    'tool-failure': ToolFailureKey
  }
}

export type { ToolFailureActionProps } from './ToolFailureAction.tsx'
export { failedToolCalls, type FailedToolCall } from './failed-tool-calls.ts'

/** Required services for dictionary and utility-slot registration. */
export const inject = ['slots', 'locale']

/** Register localized copy and the right-aligned session utility. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-tool-failures: dictionaries')
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'tool-failure-counter',
    order: 10,
    locale: NS,
  }, ToolFailureAction))
}
