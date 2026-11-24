import type { HiveAgent, HiveMessage } from '../types'

const STATUS: Record<HiveAgent['status'], string> = {
  working: '#f5b301',
  done: '#4ade80',
  failed: '#f87171',
  stopped: '#9ca3af',
}
const TEXT = '#e5e7eb'
const DIM = '#9ca3af'
const ROLES = ['frontend', 'backend', 'designer', 'qa', 'review', 'product', 'marketing', 'finance']
const SHIRTS = ['#60a5fa', '#f472b6', '#a78bfa', '#2dd4bf', '#fb923c', '#22d3ee', '#facc15', '#e879f9']

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') // the scrub refuses numeric references
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const f = (n: number) => +n.toFixed(1)

// Known roles get distinct shirts; anything else a stable hash.
function shirt(role: string) {
  const i = ROLES.indexOf(role)
  if (i >= 0) return SHIRTS[i]!
  let h = 0
  for (const c of role) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return SHIRTS[h % SHIRTS.length]!
}

// 16x14 pixel person behind a desk with a laptop, seen from the front. The shirt is drawn per card, under this.
const PERSON =
  '<g id="p">' +
  '<rect x="5" y="0" width="6" height="3" fill="#3b2a1a"/><rect x="5" y="3" width="6" height="3" fill="#f1c27d"/>' +
  '<rect x="6" y="4" width="1" height="1" fill="#111"/><rect x="9" y="4" width="1" height="1" fill="#111"/>' +
  '<rect x="3" y="10" width="2" height="1" fill="#f1c27d"/><rect x="11" y="10" width="2" height="1" fill="#f1c27d"/>' +
  '<rect x="5" y="8" width="6" height="3" fill="#4b5563"/><rect x="7.5" y="9" width="1" height="1" fill="#9ca3af"/>' +
  '<rect x="0" y="11" width="16" height="3" fill="#6b4f2a"/><rect x="0" y="11" width="16" height="1" fill="#8b6a3e"/>' +
  '</g>'

type Box = { x: number; y: number; w: number; h: number }

export function hiveSvg(agents: HiveAgent[], messages: HiveMessage[], width: number): string {
  const pad = 12
  const gx = 14
  const gy = 24
  const ch = 90
  const s = 3 // sprite scale
  const n = agents.length
  const cols = Math.max(1, Math.floor((width - 2 * pad + gx) / (100 + gx)))
  const cw = (width - 2 * pad - (cols - 1) * gx) / cols
  const used = Math.max(1, Math.min(cols, n))
  const x0 = (width - (used * cw + (used - 1) * gx)) / 2
  const rows = Math.ceil(n / cols)

  const pos = new Map<string, Box>()
  const mw = Math.min(width - 2 * pad, 2 * cw + gx)
  const main: Box = { x: (width - mw) / 2, y: pad, w: mw, h: ch }
  pos.set('main', main)
  const gridTop = main.y + ch + gy + (n ? 0 : 18)
  // Rows stay left-aligned so column gaps line up for edge routing.
  agents.forEach((a, i) =>
    pos.set(a.id, { x: x0 + (i % cols) * (cw + gx), y: gridTop + Math.floor(i / cols) * (ch + gy), w: cw, h: ch }),
  )

  // Orthogonal route through the gaps: out the bottom, along the row gap, along a column gap, into the target.
  const route = (a: Box, b: Box, attrs: string, inner = '') => {
    const toMain = b === main
    const y1 = a.y + a.h + gy / 2
    const xg = (toMain ? a.x : b.x) - gx / 2
    const y2 = toMain ? b.y + b.h + gy / 2 : b.y - gy / 2
    const d = `M${f(a.x + a.w / 2)} ${f(a.y + a.h)}V${f(y1)}H${f(xg)}V${f(y2)}H${f(b.x + b.w / 2)}V${f(toMain ? b.y + b.h : b.y)}`
    return `<path d="${d}" fill="none" ${attrs}>${inner}</path>`
  }
  const text = (x: number, y: number, size: number, fill: string, t: string, extra = '') =>
    `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${fill}" text-anchor="middle"${extra}>${esc(t)}</text>`
  const person = (x: number, shirtFill: string, extra: string) =>
    `<g transform="translate(${f(x - 8 * s)},8) scale(${s})"><rect x="3" y="6" width="10" height="5" fill="${shirtFill}"/>${extra}<use href="#p"/></g>`

  const out: string[] = []

  // Edges first, under the cards.
  for (const a of agents) {
    const p = pos.get(a.parentId && a.parentId !== a.id && pos.has(a.parentId) ? a.parentId : 'main')!
    const attrs =
      a.status === 'working' ? 'stroke="#f5b301" stroke-width="1.5" stroke-dasharray="4 3"' : 'stroke="#52525b" stroke-width="1"'
    out.push(route(p, pos.get(a.id)!, attrs))
  }
  const last = messages[messages.length - 1]
  const from = last && pos.get(last.from)
  const to = last && pos.get(last.to)
  if (last && from && to && from !== to) {
    out.push(
      route(
        from,
        to,
        'stroke="#60a5fa" stroke-width="3" stroke-linejoin="round"',
        `<title>${esc(cut(`${last.from} → ${last.to}: ${last.text}`, 200))}</title>` +
          '<animate attributeName="stroke-opacity" values="1;.35;1" dur="1.2s" repeatCount="indefinite"/>',
      ),
    )
  }

  // Manager card (the main session), with a red tie.
  const done = agents.filter(a => a.status === 'done').length
  out.push(
    `<g transform="translate(${f(main.x)},${main.y})"><title>${esc(`Manager — main session — ${done} of ${n} done`)}</title>` +
      `<rect width="${f(mw)}" height="${ch}" rx="8" fill="#1a1710" stroke="#fcd34d" stroke-width="2"/>` +
      person(mw / 2, '#e5e7eb', '<rect x="7.5" y="6" width="1" height="2" fill="#dc2626"/>') +
      text(mw / 2, 66, 11, TEXT, 'Manager', ' font-weight="700"') +
      text(mw / 2, 80, 9.5, DIM, `${done} of ${n} done`) +
      '</g>',
  )
  if (!n) out.push(text(width / 2, main.y + ch + 22, 11, '#6b7280', 'No one working yet'))

  // Desk cards.
  for (const a of agents) {
    const b = pos.get(a.id)!
    const c = STATUS[a.status] ?? DIM
    const role = a.type.replace(/^[^:]*:/, '')
    const working = a.status === 'working'
    const tip = cut([a.type, a.task, a.status, a.lastTool ?? ''].join(' — '), 300)
    const line = working && a.lastTool ? `${a.status} · ${a.lastTool}` : a.status
    const glow = working
      ? '<rect x="4" y="7" width="8" height="4.5" fill="#fde68a"><animate attributeName="opacity" values=".3;1;.3" dur="1.6s" repeatCount="indefinite"/></rect>'
      : ''
    const badge = working
      ? [0, 5, 10]
          .map(
            (dx, i) =>
              `<rect x="${f(cw - 26 + dx)}" y="12" width="3" height="3" fill="#f5b301"><animate attributeName="opacity" values=".2;1;.2" dur="1s" begin="${i * 0.2}s" repeatCount="indefinite"/></rect>`,
          )
          .join('')
      : a.status === 'done' || a.status === 'failed'
        ? `<g transform="translate(${f(cw - 13)},13)"><circle r="8" fill="${c}"/><path d="${a.status === 'done' ? 'M-3.5 0L-1 2.5L3.5-2.5' : 'M-3-3L3 3M3-3L-3 3'}" stroke="#0b0b0d" stroke-width="2" fill="none"/></g>`
        : ''
    out.push(
      `<g transform="translate(${f(b.x)},${f(b.y)})"${a.status === 'stopped' ? ' opacity=".5"' : ''}><title>${esc(tip)}</title>` +
        `<rect width="${f(cw)}" height="${ch}" rx="8" fill="#16161a" stroke="${a.status === 'stopped' ? '#3f3f46' : c}" stroke-width="1.5"/>` +
        person(cw / 2, shirt(role), glow) +
        badge +
        text(cw / 2, 66, 10.5, TEXT, cut(role, 14), ' font-weight="600"') +
        text(cw / 2, 80, 9.5, c, cut(line, 16)) +
        '</g>',
    )
  }

  // Legend: 4 items, 2 per row when narrow.
  const items: [string, string][] = [
    ['Working', '<rect x="0" y="-8" width="10" height="10" fill="#f5b301"/>'],
    ['Done', '<rect x="0" y="-8" width="10" height="10" fill="#4ade80"/>'],
    ['Message just sent', '<line x1="0" y1="-3" x2="14" y2="-3" stroke="#60a5fa" stroke-width="3"/>'],
    ['Waiting on', '<line x1="0" y1="-3" x2="14" y2="-3" stroke="#f5b301" stroke-width="1.5" stroke-dasharray="4 3"/>'],
  ]
  const perRow = width < 540 ? 2 : 4
  const cellW = (width - 2 * pad) / perRow
  const legendY = (n ? gridTop + rows * (ch + gy) : gridTop) + 14
  items.forEach(([name, swatch], i) => {
    const lx = pad + (i % perRow) * cellW + 4
    const ly = legendY + Math.floor(i / perRow) * 18
    out.push(`<g transform="translate(${f(lx)},${f(ly)})">${swatch}<text x="20" y="0" font-size="10" fill="${DIM}">${name}</text></g>`)
  })
  const height = Math.ceil(legendY + (Math.ceil(items.length / perRow) - 1) * 18 + 10)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="ui-monospace, Menlo, monospace">` +
    `<defs>${PERSON}</defs>` +
    `<rect width="100%" height="100%" fill="#0b0b0d"/>` +
    out.join('') +
    '</svg>'
  )
}
