// One subagent the session started (outfit or any other type).
export type HiveAgent = {
  id: string
  // Agent type as spawned, e.g. 'outfit:frontend', 'Explore'.
  type: string
  // The Agent call's short description of the task.
  task: string
  // Who started it; absent = the main session (the coordinator).
  parentId?: string
  status: 'working' | 'done' | 'failed' | 'stopped'
  // Last tool the agent called while working, e.g. 'Edit'.
  lastTool?: string
  startedAt: number
  endedAt?: number
}

// One message between agents. 'main' is the main session.
export type HiveMessage = {
  at: number
  from: string
  to: string
  kind: 'spawn' | 'report' | 'send'
  text: string
}

declare module 'claude-code' {
  interface PluginState {
    'outfit-view': {
      agents: Shaped<HiveAgent[]>
      messages: Shaped<HiveMessage[]>
      isOpen: boolean
    }
  }
}
