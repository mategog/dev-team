import { expect, test } from 'claude-code/testing'
import type { HiveAgent, HiveMessage } from '../types'
import { hiveSvg } from './hive'

const agent = (id: string, type: string, status: HiveAgent['status'], extra: Partial<HiveAgent> = {}): HiveAgent => ({
  id,
  type,
  task: `task ${id}`,
  status,
  startedAt: 0,
  ...extra,
})

test('empty input is a valid svg with the manager alone', async () => {
  const svg = hiveSvg([], [], 360)
  expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
  expect(svg.endsWith('</svg>')).toBe(true)
  expect(svg).toContain('No one working yet')
  expect(svg).toContain('>Manager<')
  expect(svg).toContain('0 of 0 done')
})

test('mixed agents show roles, statuses, last tool and escape text', async () => {
  const agents = [
    agent('a1', 'dev-team:frontend', 'working', { task: "make <b>& it's", lastTool: 'Edit' }),
    agent('a2', 'dev-team:backend', 'done'),
    agent('a3', 'Explore', 'failed', { parentId: 'a1' }),
  ]
  const messages: HiveMessage[] = [{ at: 1, from: 'main', to: 'a1', kind: 'send', text: 'hi "there"' }]
  const svg = hiveSvg(agents, messages, 500)
  for (const s of ['>frontend<', '>backend<', '>Explore<', '>working · Edit<', '>done<', '>failed<', '1 of 3 done', 'stroke-linejoin="round"'])
    expect(svg).toContain(s)
  expect(svg).toContain('make &lt;b&gt;&amp; it&apos;s')
  expect(svg).toContain('hi &quot;there&quot;')
  expect(svg).not.toContain('&#')
  expect(svg).not.toContain('<b>')
  expect(svg).not.toContain('No one working yet')
})

test('30 agents stay under the size limit, even with escape-heavy text', async () => {
  const long = '&<'.repeat(3000)
  const agents = Array.from({ length: 30 }, (_, i) =>
    agent(`a${i}`, `dev-team:${long}`, (['working', 'done', 'failed', 'stopped'] as const)[i % 4]!, { task: long, lastTool: long }),
  )
  const svg = hiveSvg(agents, [{ at: 1, from: 'a3', to: 'a7', kind: 'send', text: long }], 360)
  expect(svg.length).toBeLessThan(131072)
})

test('a message to an unknown name does not throw or highlight', async () => {
  const svg = hiveSvg([agent('a1', 'dev-team:qa', 'working')], [{ at: 1, from: 'main', to: 'nobody', kind: 'send', text: 'x' }], 360)
  expect(svg).toContain('>qa<')
  expect(svg).not.toContain('stroke-linejoin="round"')
})
