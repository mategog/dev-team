import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { HiveAgent, HiveMessage } from '../types'
import { hiveSvg, testsLabel } from './hive'

const PANE = 'outfit-view'
const TITLE = 'Team'
// Change a tag when its item's fields change: an earlier version's value outlives a reload.
const agents = atom({ plugin: 'outfit-view', key: 'agents' } as const, [], { shape: 'agents-2' })
const messages = atom({ plugin: 'outfit-view', key: 'messages' } as const, [], { shape: 'messages-1' })
// Whether the pane is open: false after the person closes it, so the band below offers a way back.
const isOpen = atom({ plugin: 'outfit-view', key: 'isOpen' } as const, true)
// Session cost when the first agent started, so the header shows what the team run cost.
const costFrom = atom({ plugin: 'outfit-view', key: 'costFrom' } as const, null as number | null)

// The runners ponytail's band counts, plus this repo's own `claude plugin test`, at the start of a command segment
// (after env assignments), so `cat jest.config.js` is not a test run.
const TEST_CMD =
  /(?:^|[;&|(]\s*)(?:\w+=\S*\s+)*(npm (run )?test|pnpm (run )?test|yarn test|bun test|npx (jest|vitest)|jest|vitest|pytest|python3? -m pytest|go test|cargo test|mvn test|gradle test|rspec|phpunit|dotnet test|node --test|deno test|make test|claude plugin test)\b/
// Pass and fail counts from pytest, jest/vitest, cargo, bun (" 9 pass"), node --test and TAP.
// jest and vitest print a Suites/Files line first: their `Tests` line holds the test counts.
const testCounts = (out: string) => {
  const line = out.split('\n').find(l => /^\s*Tests\b/.test(l)) ?? out
  const num = (re: RegExp) => {
    const m = re.exec(line)
    return m ? Number(m[1]) : undefined
  }
  return {
    passed: num(/(\d+) (?:passed|passing|pass)\b/) ?? num(/(?:ℹ |# )pass (\d+)/),
    failed: num(/(\d+) (?:failed|failing|fail)\b/) ?? num(/(?:ℹ |# )fail (\d+)/),
  }
}

const clip = (s: string, n: number) => {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length > n ? one.slice(0, n - 1) + '…' : one
}
const role = (type: string) => type.replace(/^.*:/, '')
const duration = (ms: number) => {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

// The team run as Markdown lists (task text may hold `|`, which would break a table).
const markdown = (all: HiveAgent[], log: HiveMessage[], name: (id: string) => string, header: string) =>
  [
    `## ${header}`,
    '',
    ...all.map(a =>
      [`- **${role(a.type)}**: ${a.task}`, a.status, duration((a.endedAt ?? Date.now()) - a.startedAt), a.tests && testsLabel(a.tests)]
        .filter(Boolean)
        .join(' · '),
    ),
    '',
    '### Last messages',
    '',
    ...log.slice(-8).map(m => `- ${name(m.from)} → ${name(m.to)} (${m.kind}): ${m.text}`),
  ].join('\n')

const say = ($: EngineInterface, m: Omit<HiveMessage, 'at'>) =>
  update($, messages, list => [...list, { ...m, at: Date.now(), text: clip(m.text, 300) }].slice(-100))

const open = async ($: EngineInterface) => {
  const opened = await $.ui.open({ id: PANE, title: TITLE })
  await update($, isOpen, () => opened.isPlaced)
  return opened
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'team', description: 'Show the agent team: who works on what, and their messages' })
    return next(e)
  })

  on('command.run', { command: 'team' }, async $ => {
    const opened = await open($)
    return { text: opened.isPlaced ? 'Team pane opened.' : `Team pane not shown: ${opened.reason}` }
  })

  on('ui.close', { id: PANE }, async ($, e, next) => {
    await update($, isOpen, () => false)
    return next(e)
  })

  // While the pane is closed, a button above the prompt brings it back.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isOpen))) return next(e)
    const { Box, Button } = $.ui.resolve(e)
    return (
      <Box>
        <Button key="team" label="Team ▸" onPress={() => open($)} />
      </Box>
    )
  })

  on('agent.spawn', async ($, e, next) => {
    // Read before the agent runs: the baseline for "since first agent".
    const usd = (await $.session.usage().catch(() => undefined))?.cost?.usd
    const started = await next(e)
    if (!started.agentId) return started
    if (usd !== undefined) await update($, costFrom, c => c ?? usd)
    const agent: HiveAgent = {
      id: started.agentId,
      type: e.subagentType,
      task: e.description,
      parentId: e.parentAgentId,
      status: 'working',
      startedAt: Date.now(),
    }
    let isFirst = false
    await update($, agents, list => {
      isFirst = list.length === 0
      return [...list.filter(a => a.id !== agent.id), agent].slice(-60)
    })
    await say($, { from: e.parentAgentId ?? 'main', to: agent.id, kind: 'spawn', text: e.description })
    // The first agent of the session opens the pane, unless the person closed it already.
    if (isFirst && (await read($, isOpen))) await open($).catch(() => undefined)
    return started
  })

  on('agent.report', async ($, e, next) => {
    const status = e.status === 'completed' ? ('done' as const) : e.status
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
    if (!id) return next(e)
    const set = (fn: (a: HiveAgent) => HiveAgent) => update($, agents, list => list.map(a => (a.id === id ? fn(a) : a)))
    await set(a => ({ ...a, lastTool: String(e.tool) }))
    const ran = await next(e)
    if (ran.deny !== undefined) return ran
    // The tool has already run: a failed write here must not fail the call.
    // A background run returns before any test ran; a piped run (`npm test | tail`) exits 0 on failures.
    if (e.tool === 'Bash' && !e.run_in_background && TEST_CMD.test(e.command)) {
      const counts = testCounts(ran.text ?? '')
      const tests = { state: ran.isError || (counts.failed ?? 0) > 0 ? ('fail' as const) : ('pass' as const), ...counts }
      await set(a => ({ ...a, tests })).catch(() => undefined)
    } else if ((e.tool === 'Edit' || e.tool === 'Write') && !ran.isError) {
      await set(a => (a.tests ? { ...a, tests: { ...a.tests, state: 'stale' as const } } : a)).catch(() => undefined)
    }
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const all = await read($, agents)
    const log = await read($, messages)
    const name = (id: string) => (id === 'main' ? 'coordinator' : role(all.find(a => a.id === id)?.type ?? id))
    const cols = e.props.bodyColumns
    // Desktop draws an SVG in a frame: width is capped to the pane, height is 150px unless given. A column is about
    // 9 CSS px and a row about 19 (measured), so half the pane's height is rows * 10.
    const rows = e.viewport?.rows ?? e.props.scroll.bodyRows
    const px = Math.max(300, cols * 9)
    const hive = hiveSvg(all, log, px, rows * 10)
    const { Box, Text, Button } = $.ui.resolve(e)

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
        {a.tests ? ` · ${testsLabel(a.tests)}` : ''}
      </Text>
    ))

    // Spend since the first agent started; no figure where the host keeps no cost.
    const from = await read($, costFrom)
    const usd = (await $.session.usage().catch(() => undefined))?.cost?.usd
    // A cost below the baseline means the engine started its ledger over.
    const spent = from === null || usd === undefined ? undefined : usd >= from ? usd - from : usd
    const header = spent === undefined ? 'Team' : `Team · $${spent.toFixed(2)} since first agent`
    const copy = async () => {
      const done = await $.ui.copy({ text: markdown(all, log, name, header), surface: e.surface })
      $.ui.toast(done.isCopied ? 'Team run copied as Markdown' : `Copy failed: ${done.reason}`)
    }

    // The terminal has no Svg: it gets the plain list below instead.
    const Svg = e.surface === 'terminal' ? undefined : $.ui.resolve(e).Svg
    const picture = Svg && (
      <Svg
        source={hive.source}
        width={px}
        height={hive.height}
        alt={`${working.length} agents working, ${all.length - working.length} finished`}
        isInteractive
      />
    )

    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text dimColor>{header}</Text>
          <Box flexGrow={1} />
          <Button key="copy" plain label="Copy" onPress={copy} />
        </Box>
        {picture ?? (all.length === 0 ? (
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
