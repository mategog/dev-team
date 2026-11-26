import { expect, test, type TestBody } from 'claude-code/testing'

const PANE = {
  plugin: 'outfit-view',
  component: 'Pane',
  requestId: 'outfit-view',
  props: {
    title: 'Team',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('a spawned agent, its tool, its report and a message reach the pane', async ($, on) => {
  on('ui.open', () => ({ value: { isPlaced: true } }))
  // Hooks here stand for the engine beneath the mod.
  on('agent.spawn', () => ({ model: 'sonnet', agentId: 'a1' }))
  on('agent.report', (_, e) => ({ text: e.text }))
  on('tool.call', () => ({ result: {} }))
  on('session.send', () => ({ isDelivered: true }))

  await $.agent.spawn({
    tool_use_id: 't1',
    prompt: 'Build the export button',
    description: 'Build export',
    subagentType: 'outfit:frontend',
    provider: { plugin: 'outfit', tier: 'user' },
    parentModel: 'opus',
    background: true,
    fork: false,
  })
  await $.tool.call({ tool: 'Bash', command: 'ls', agentId: 'a1' })

  // `frontend:` matches the agent row, not the message row ("→ frontend (spawn)").
  const terminal = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const row = (await terminal.find({ type: 'Text', text: /frontend:/ }))?.text
  expect(row).toContain('working')
  expect(row).toContain('Bash')
  await terminal.unmount()

  await $.session.send({ to: 'a1', text: 'use the design tokens', origin: { kind: 'model' } })
  await $.agent.report({
    agentId: 'a1',
    subagentType: 'outfit:frontend',
    provider: { plugin: 'outfit', tier: 'user' },
    status: 'completed',
    text: 'Export button done',
  })

  const after = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await after.find({ type: 'Text', text: /frontend:/ }))?.text).toContain('done')
  expect(await after.find({ type: 'Text', text: /Export button done/ })).toBeTruthy()
  expect(await after.find({ type: 'Text', text: /design tokens/ })).toBeTruthy()
  await after.unmount()

  const desktop = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await desktop.find({ type: 'Svg' })).toBeTruthy()
  await desktop.unmount()
})

test('an empty session draws placeholders', async ($) => {
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /No agents/ }))?.text).toBe('No agents yet.')
  await ui.unmount()
})

const BAND = {
  plugin: 'outfit-view',
  component: 'AbovePrompt',
  surface: 'desktop',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 3,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 3 },
    view: {},
  },
} as const

// What the mod stored under `isOpen`: false once the person closed the pane.
const stored = (value: boolean) => ({ value: { value, version: 1 } })

// The engine beneath the mod: one agent id, and a record of which panes it was asked to open.
const engine = (on: Parameters<TestBody>[1]) => {
  const opened: string[] = []
  on('ui.open', (_, e) => (opened.push(e.id), { value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'sonnet', agentId: 'a1' }))
  on('command.register', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }) as never)
  return opened
}

const spawn = ($: Parameters<TestBody>[0]) =>
  $.agent.spawn({
    tool_use_id: 't1',
    prompt: 'Build the export button',
    description: 'Build export',
    subagentType: 'outfit:frontend',
    provider: { plugin: 'outfit', tier: 'user' },
    parentModel: 'opus',
    background: true,
    fork: false,
  })

test('a closed pane is reopened from a button above the prompt', async ($, on) => {
  let opens = 0
  on('state.get', () => stored(false))
  on('state.set', () => ({ value: { isSet: true, version: 2 } }))
  on('ui.open', () => (opens++, { value: { isPlaced: true } }))

  const ui = await $.ui.mount(BAND)
  expect((await ui.find({ type: 'Button' }))?.text).toContain('Team')
  await ui.press({ key: 'team' })
  expect(opens).toBe(1)
  await ui.unmount()
})

test('an open pane adds no button', async ($, on) => {
  on('state.get', () => stored(true))
  const ui = await $.ui.mount(BAND)
  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})

test('the pane opens at the first agent, not at session start or later agents', async ($, on) => {
  const opened = engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(opened).toEqual([])
  await spawn($)
  await spawn($)
  expect(opened).toEqual(['outfit-view'])
})

test('a pane the person closed is not opened again by the first agent', async ($, on) => {
  const opened = engine(on)
  // The test's `$` cannot raise a person's close: seed what the mod's ui.close hook stores.
  on('state.get', (_, e, next) => (e.key === 'isOpen' ? stored(false) : next(e)))
  await spawn($)
  expect(opened).toEqual([])
})

test("an agent's test runs show on its row: pass, stale after an edit, fail", async ($, on) => {
  engine(on)
  on('tool.call', (_, e) =>
    e.tool !== 'Bash'
      ? { result: {}, text: '' }
      : e.command === 'npm test'
        ? { isError: true as const, result: {}, text: 'Test Suites: 1 failed, 3 passed\nTests:       2 failed, 11 passed' }
        : e.command === 'npm test 2>&1 | tail -25'
          ? { result: {}, text: 'Test Suites: 1 failed, 1 total\nTests:       3 failed, 40 passed' }
          : { result: {}, text: ' 13 pass\n 0 fail' },
  )
  await spawn($)
  const row = async () => {
    const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
    const text = (await ui.find({ type: 'Text', text: /frontend:/ }))?.text
    await ui.unmount()
    return text
  }

  await $.tool.call({ tool: 'Bash', command: 'ls', agentId: 'a1' })
  await $.tool.call({ tool: 'Bash', command: 'cat jest.config.js', agentId: 'a1' })
  await $.tool.call({ tool: 'Bash', command: 'npm test', run_in_background: true, agentId: 'a1' })
  expect(await row()).not.toContain('tests')
  await $.tool.call({ tool: 'Bash', command: 'claude plugin test .', agentId: 'a1' })
  expect(await row()).toContain('✓ 13 tests')
  await $.tool.call({ tool: 'Edit', file_path: '/x.ts', old_string: 'a', new_string: 'b', agentId: 'a1' })
  expect(await row()).toContain('tests stale')
  await $.tool.call({ tool: 'Bash', command: 'npm test', agentId: 'a1' })
  expect(await row()).toContain('✗ 2 failed')
  // A piped run exits 0 on failures: the output decides.
  await $.tool.call({ tool: 'Bash', command: 'npm test 2>&1 | tail -25', agentId: 'a1' })
  expect(await row()).toContain('✗ 3 failed')
  await $.tool.call({ tool: 'Bash', command: 'cd app && CI=1 npm test', agentId: 'a1' })
  expect(await row()).toContain('✓ 13 tests')
  // The main session's own test run is not an agent's.
  await $.tool.call({ tool: 'Bash', command: 'claude plugin test .' })
  expect(await row()).toContain('✓ 13 tests')
})

test('the header shows the spend since the first agent, and nothing without a cost', async ($, on) => {
  engine(on)
  let cost: { usd: number } | undefined = { usd: 1 }
  on('session.usage', () => ({ value: { startedAt: 0, cost } }) as never)
  await spawn($)
  cost = { usd: 2.84 }
  let ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /since first agent/ }))?.text).toBe('Team · $1.84 since first agent')
  await ui.unmount()

  cost = undefined
  ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /since first agent/ })).toBeUndefined()
  await ui.unmount()
})

test('Copy hands the team run to the clipboard as Markdown', async ($, on) => {
  engine(on)
  const copied: string[] = []
  const toasts: string[] = []
  on('ui.copy', (_, e) => (copied.push(e.text), { value: { isCopied: true as const } }))
  on('ui.toast', (_, e) => (toasts.push(String(e.text)), { value: undefined }))
  await spawn($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    await ui.press({ key: 'copy' })
    await ui.unmount()
  }
  expect(copied.length).toBe(2)
  expect(copied[0]).toContain('## Team')
  expect(copied[0]).toContain('- **frontend**: Build export · working · ')
  expect(copied[0]).toContain('### Last messages')
  expect(copied[0]).toContain('- coordinator → frontend (spawn): Build export')
  expect(toasts[0]).toBe('Team run copied as Markdown')
})
