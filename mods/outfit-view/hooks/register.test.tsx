import { expect, test } from 'claude-code/testing'

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
