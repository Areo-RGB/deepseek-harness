import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { IconChevronDownOutline14, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { failedToolCalls } from './failed-tool-calls.ts'
import { NS } from './locales.ts'
import css from './ToolFailureAction.module.css'

/** Full props supplied by the session utility slot and locale seat. */
export type ToolFailureActionProps =
  PropsRuntime<'conversation.session.header.utilities'> & PropsLocale<typeof NS>

/** Session-header disclosure for failures in the currently loaded history window. */
export function ToolFailureAction({ useSession, t }: ToolFailureActionProps) {
  const nodes = useSession(snapshot => snapshot.nodes)
  const hasMore = useSession(snapshot => snapshot.hasMore)
  const failures = useMemo(() => failedToolCalls(nodes), [nodes])
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => { document.removeEventListener('pointerdown', closeOutside) }
  }, [open])

  useEffect(() => {
    if (failures.length === 0 && open) setOpen(false)
  }, [failures.length, open])

  if (failures.length === 0) return null

  const countLabel = t(failures.length === 1 ? 'count.one' : 'count.other', { count: failures.length })
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={css.root} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        aria-expanded={open}
        aria-label={countLabel}
        onClick={() => { setOpen(current => !current) }}
      >
        <StateDot state="error" className={css.triggerDot} />
        <span className={css.count}>{countLabel}</span>
        <IconChevronDownOutline14 className={open ? css.triggerOpen : undefined} />
      </button>
      {open
        ? (
          <div className={css.menu}>
            <ul className={css.list} aria-label={t('list.aria')}>
              {failures.map(failure => (
                <li key={`${failure.callId}:${failure.seq}`} className={css.row}>
                  <StateDot state="error" className={css.rowDot} />
                  <span className={css.tool} title={failure.toolName}>{failure.toolName}</span>
                  <span className={css.summary} title={failure.summary || t('failure.unknown')}>
                    {failure.summary || t('failure.unknown')}
                  </span>
                </li>
              ))}
            </ul>
            {hasMore ? <p className={css.partial}>{t('history.partial')}</p> : null}
          </div>
        )
        : null}
    </div>
  )
}
