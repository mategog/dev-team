import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { HiveAgent, HiveMessage } from '../types'
import { hiveSvg } from './hive'

const PANE = 'dev-team-view'
const TITLE = 'Team'
// Change a tag when its item's fields change: an earlier version's value outlives a reload.
const agents = atom({ plugin: 'dev-team-view', key: 'agents' } as const, [], { shape: 'agents-1' })
const messages = atom({ plugin: 'dev-team-view', key: 'messages' } as const, [], { shape: 'messages-1' })

const clip = (s: string, n: number) => {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length > n ? one.slice(0, n - 1) + '…' : one
}
const role = (type: string) => type.replace(/^.*:/, '')

const say = ($: EngineInterface, m: Omit<HiveMessage, 'at'>) =>
  update($, messages, list => [...list, { ...m, at: Date.now(), text: clip(m.text, 300) }].slice(-100))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'team', description: 'Show the dev team: who works on what, and their messages' })
    void $.ui.open({ id: PANE, title: TITLE })
    return next(e)
  })

  on('command.run', { command: 'team' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Team pane opened.' }
  })

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (!started.agentId) return started
    const agent: HiveAgent = {
      id: started.agentId,
      type: e.subagentType,
      task: e.description,
      parentId: e.parentAgentId,
      status: 'working',
      startedAt: Date.now(),
    }
    await update($, agents, list => [...list.filter(a => a.id !== agent.id), agent].slice(-60))
    await say($, { from: e.parentAgentId ?? 'main', to: agent.id, kind: 'spawn', text: e.description })
    return started
  })

  on('agent.report', async ($, e, next) => {
    const status = e.status === 'completed' ? 'done' : e.status
    await update($, agents, list =>
      list.map(a => (a.id === e.agentId ? { ...a, status, endedAt: Date.now() } : a)),
    )
    await say($, { from: e.agentId, to: e.parentAgentId ?? 'main', kind: 'report', text: e.text || `(${e.status})` })
    return next(e)
  })

  on('session.send', async ($, e, next) => {
    await say($, { from: e.agentId ?? 'main', to: e.to, kind: 'send', text: e.text })
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const id = e.agentId
    if (id) await update($, agents, list => list.map(a => (a.id === id ? { ...a, lastTool: String(e.tool) } : a)))
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const all = await read($, agents)
    const log = await read($, messages)
    const name = (id: string) => (id === 'main' ? 'coordinator' : role(all.find(a => a.id === id)?.type ?? id))
    const cols = e.props.bodyColumns
    const { Box, Text } = $.ui.resolve(e)

    const feed = log.slice(-8).map(m => (
      <Text>
        <Text bold>{name(m.from)}</Text>
        <Text dimColor> → {name(m.to)} ({m.kind}) </Text>
        {clip(m.text, Math.max(20, cols * 2))}
      </Text>
    ))

    const working = all.filter(a => a.status === 'working')
    const list = all.slice(-12).map(a => (
      <Text dimColor={a.status !== 'working'}>
        {a.status.padEnd(8)} {role(a.type)}: {clip(a.task, 40)}
        {a.status === 'working' && a.lastTool ? ` · ${a.lastTool}` : ''}
      </Text>
    ))

    // The terminal has no Svg: it gets the plain list below instead.
    const Svg = e.surface === 'terminal' ? undefined : $.ui.resolve(e).Svg
    const hive = Svg && (
      <Svg
        source={hiveSvg(all, log, Math.max(320, cols * 8))}
        alt={`${working.length} agents working, ${all.length - working.length} finished`}
        isInteractive
      />
    )

    return (
      <Box flexDirection="column">
        {hive ?? (all.length === 0 ? (
          <Text dimColor>No agents yet.</Text>
        ) : (
          list
        ))}
        <Text bold>Messages</Text>
        {log.length === 0 ? <Text dimColor>No messages yet.</Text> : feed}
      </Box>
    )
  })
}
