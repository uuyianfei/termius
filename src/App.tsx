import { useState } from 'react'
import { Layout } from './Layout'
import { TerminalComponent } from './components/Terminal'
import { Server, Plus, Search, MoreVertical, Command } from 'lucide-react'
import { cn } from './lib/utils'

function App() {
  const [view, setView] = useState<'hosts' | 'terminal'>('hosts')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [terminals, setTerminals] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    const id = 'session-' + Date.now()

    // In a real app, we would get credentials from a form or store.
    // For demo, we try to connect to a dummy endpoint or let it fail gracefully/timeout 
    // to show the terminal UI. 
    // Actually, asking for user input would be better, but let's just show the terminal
    // immediately to mimic a "connecting" state or just start the shell.

    // For the UI demo, we'll switch immediately.
    setTerminals([...terminals, id])
    setSessionId(id)
    setView('terminal')
    setIsConnecting(false)

    // Attempt connection in background (this will likely fail without real creds)
    try {
      await window.electronAPI.connectSSH(id, {
        host: '127.0.0.1',
        port: 22,
        username: 'root',
        password: 'password'
      })
    } catch (err) {
      console.log("Connection failed (as expected in demo):", err)
      // We can write to the terminal via IPC to show error?
      // Or just let the terminal component handle it via onSSHData/Error
    }
  }

  return (
    <Layout>
      {view === 'hosts' ? (
        <div className="flex h-full w-full flex-col p-6 text-white space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hosts</h1>
              <p className="text-zinc-500 text-sm">Manage your connections</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
              <Plus className="h-4 w-4" />
              New Host
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search hosts..."
              className="h-10 w-full rounded-xl border border-white/5 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 outline-none ring-1 ring-white/5 transition-all focus:bg-zinc-900 focus:ring-indigo-500/50 placeholder:text-zinc-600"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div
              onClick={isConnecting ? undefined : handleConnect}
              className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-white/5 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5 transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                  {isConnecting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  ) : (
                    <Server className="h-5 w-5" />
                  )}
                </div>
                <button className="rounded-md p-1 hover:bg-white/10 text-zinc-500 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">Production Server</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  <p className="text-xs text-zinc-500 font-medium">192.168.1.20 • SSH</p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-3">
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-400 border border-white/5">Ubuntu</span>
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-400 border border-white/5">AWS</span>
              </div>
            </div>

            {/* Add more mock items for visual fullness */}
            {[1, 2].map((i) => (
              <div key={i} className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-white/5 bg-zinc-900/30 p-5 transition-all hover:bg-zinc-800/50 hover:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <Command className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400">Database Cluster {i}</h3>
                  <p className="text-xs text-zinc-600 mt-1">10.0.0.{50 + i} • Postgres</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col bg-[#1e1e2e]">
          {/* Tab Bar */}
          <div className="flex h-9 items-center gap-1 border-b border-black/20 bg-[#181825] px-2 pt-1 select-none">
            {terminals.map(id => (
              <button
                key={id}
                onClick={() => setSessionId(id)}
                className={cn(
                  "group flex min-w-[120px] max-w-[200px] items-center justify-between gap-2 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors",
                  sessionId === id
                    ? "bg-[#1e1e2e] text-indigo-300 shadow-sm"
                    : "bg-transparent text-zinc-500 hover:bg-[#1e1e2e]/50 hover:text-zinc-300"
                )}
              >
                <span className="truncate">root@production</span>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    const newTerms = terminals.filter(t => t !== id)
                    setTerminals(newTerms)
                    if (sessionId === id) setSessionId(newTerms[0] || null)
                    if (newTerms.length === 0) setView('hosts')
                    window.electronAPI.disconnectSSH(id)
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-white/10 hover:text-red-400"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6M7 1l-6 6" /></svg>
                </div>
              </button>
            ))}
            <button onClick={() => setView('hosts')} className="ml-1 rounded p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* Terminal Area */}
          <div className="relative flex-1 bg-[#1e1e2e] p-1">
            {/* Terminals are kept in DOM but hidden to preserve state? 
                   Or we remount? Ideally keep in DOM. Xterm works best if not checking display:none heavily, but React handles it. 
                   For now, simply render the active one.
               */}
            {sessionId && <TerminalComponent sessionId={sessionId} />}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
