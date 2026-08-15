// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import type {
  ConversationNode, ConversationSnapshot, RunningToolCall, SessionId, ToolResultNode,
} from '@deepseek-ai/dsh-client-runtime/client'
import { ToolFailureAction, type ToolFailureActionProps } from '../src/client/ToolFailureAction.tsx'
import { failedToolCalls } from '../src/client/failed-tool-calls.ts'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

const SESSION = 'session' as SessionId
const t: ToolFailureActionProps['t'] = makeTranslate(en)

function settled(over: Partial<ToolResultNode> = {}): ToolResultNode {
  return {
    kind: 'tool-result',
    seq: 10,
    time: 1_000,
    callId: 'call-1',
    call: { name: 'bash', argsRaw: '{}' },
    callTime: 900,
    content: [{ type: 'text', text: 'boom' }],
    isError: true,
    callView: null,
    resultView: null,
    subCalls: [],
    ...over,
  }
}

function running(over: Partial<RunningToolCall> = {}): RunningToolCall {
  return {
    callId: 'running-1',
    name: 'read',
    argsRaw: '{}',
    turn: 1,
    step: 1,
    time: 1_100,
    callView: null,
    subCalls: [],
    ...over,
  }
}

function props(nodes: readonly ConversationNode[], hasMore = false): ToolFailureActionProps {
  const snapshot = { nodes, hasMore } as ConversationSnapshot
  function useSession<T>(select: (value: ConversationSnapshot) => T): T {
    return select(snapshot)
  }
  return { sessionId: SESSION, useSession, t } as unknown as ToolFailureActionProps
}

function rows(): string[] {
  const list = screen.getByRole('list', { name: en['list.aria'] })
  return within(list).getAllByRole('listitem').map(row => row.textContent ?? '')
}

describe('failedToolCalls', () => {
  it('collects root and nested failures newest-first and excludes interrupted results', () => {
    const nestedFailure = settled({
      seq: 12,
      time: 1_200,
      callId: 'nested-failed',
      call: { name: 'read', argsRaw: '{}' },
      content: [{ type: 'text', text: '\nmissing file\nmore detail' }],
    })
    const nestedStopped = settled({
      seq: 13,
      time: 1_300,
      callId: 'nested-stopped',
      call: { name: 'bash', argsRaw: '{}' },
      error: { name: 'Interrupted', code: 'interrupted' },
    })
    const rootSuccess = settled({
      seq: 14,
      time: 1_400,
      callId: 'root-success',
      isError: false,
      subCalls: [nestedFailure, nestedStopped, running()],
    })
    const rootFailure = settled({
      seq: 11,
      time: 1_100,
      callId: 'root-failed',
      call: null,
      content: [],
      error: { name: 'ToolError', code: 'DENIED' },
    })

    expect(failedToolCalls([rootFailure, rootSuccess])).toEqual([
      {
        callId: 'nested-failed',
        toolName: 'read',
        summary: 'missing file',
        time: 1_200,
        seq: 12,
      },
      {
        callId: 'root-failed',
        toolName: 'root-failed',
        summary: 'ToolError: DENIED',
        time: 1_100,
        seq: 11,
      },
    ])
  })

  it('falls back to an empty summary when no text or structured error exists', () => {
    expect(failedToolCalls([settled({ content: [] })])[0]?.summary).toBe('')
  })
})

describe('ToolFailureAction visibility and content', () => {
  it('renders nothing when the loaded history has no failed Tool call', () => {
    const { container } = render(<ToolFailureAction {...props([
      settled({ isError: false }),
    ])} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the count, expands to failed calls, and reports truncated history', () => {
    render(<ToolFailureAction {...props([
      settled({
        seq: 20,
        time: 2_000,
        callId: 'write-1',
        call: { name: 'write', argsRaw: '{}' },
        content: [{ type: 'text', text: 'permission denied\nsecond line' }],
      }),
      settled({
        seq: 19,
        time: 1_900,
        callId: 'read-1',
        call: { name: 'read', argsRaw: '{}' },
        content: [],
      }),
    ], true)} />)

    const trigger = screen.getByRole('button', { name: '2 failed tool calls' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(rows()).toEqual([
      'writepermission denied',
      `read${en['failure.unknown']}`,
    ])
    expect(screen.getByText(en['history.partial'])).toBeDefined()
  })
})

describe('ToolFailureAction dismissal', () => {
  it('closes on Escape, restores trigger focus, and closes on an outside pointer press', () => {
    render(<ToolFailureAction {...props([settled()])} />)
    const trigger = screen.getByRole('button', { name: '1 failed tool call' })

    fireEvent.click(trigger)
    expect(screen.getByRole('list', { name: en['list.aria'] })).toBeDefined()
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    fireEvent.pointerDown(screen.getByRole('list', { name: en['list.aria'] }))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.pointerDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})
