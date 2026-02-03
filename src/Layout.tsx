import React, { useState } from 'react'
import { Monitor, Settings, Terminal as TerminalIcon, Laptop2, FolderOpen } from 'lucide-react'
import { cn } from './lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState('hosts')

    return (
        <div className="flex h-screen w-full flex-col bg-zinc-950/80 text-foreground overflow-hidden rounded-xl border border-white/5 shadow-2xl backdrop-blur-xl">
            {/* Custom Titlebar */}
            <header
                className="flex h-10 w-full items-center justify-between border-b border-white/5 bg-zinc-900/40 px-3 z-50 select-none"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                <div className="flex items-center gap-3">
                    {/* Logo / Title */}
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner">
                            <TerminalIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="tracking-tight">Termius Clone</span>
                    </div>
                </div>

                {/* Windows Controls (Mockup for now, hooked to IPC) */}
                <div
                    className="flex items-center gap-1"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <WindowControl onClick={() => window.electronAPI.minimize()} className="hover:bg-white/10">
                        <svg width="10" height="1" viewBox="0 0 10 1"><path d="M0 0h10v1H0z" fill="currentColor" /></svg>
                    </WindowControl>
                    <WindowControl onClick={() => window.electronAPI.maximize()} className="hover:bg-white/10">
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1h8v8H1V1zm1 1v6h6V2H2z" fill="currentColor" /></svg>
                    </WindowControl>
                    <WindowControl onClick={() => window.electronAPI.close()} className="hover:bg-red-500 hover:text-white">
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.2" /></svg>
                    </WindowControl>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="group flex w-[70px] flex-col items-center gap-6 border-r border-white/5 bg-zinc-900/20 py-6 backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-zinc-900/30">
                    <SidebarItem icon={Monitor} label="Hosts" active={activeTab === 'hosts'} onClick={() => setActiveTab('hosts')} />
                    <SidebarItem icon={FolderOpen} label="SFTP" active={activeTab === 'sftp'} onClick={() => setActiveTab('sftp')} />
                    <div className="h-px w-8 bg-white/5" /> {/* Divider */}
                    <SidebarItem icon={Laptop2} label="Local" active={activeTab === 'local'} onClick={() => setActiveTab('local')} />

                    <div className="flex-1" />
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

                    {/* Profile Avatar */}
                    <div className="mt-4 h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800 shadow-lg cursor-pointer hover:border-indigo-500/50 transition-colors">
                        <img src="https://github.com/shadcn.png" alt="User" />
                    </div>
                </aside>

                {/* content area */}
                <main className="relative flex-1 bg-transparent">
                    {/* Background elements for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />

                    <div className="relative h-full w-full overflow-hidden p-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function WindowControl({ children, onClick, className }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex h-8 w-10 items-center justify-center text-zinc-400 transition-colors",
                className
            )}
        >
            {children}
        </button>
    )
}

function SidebarItem({ icon: Icon, active, onClick, label }: any) {
    return (
        <div className="relative">
            {active && (
                <div className="absolute -left-[27px] top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-md bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
            )}
            <button
                onClick={onClick}
                className={cn(
                    "group/btn relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                    active
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                )}
            >
                <Icon className="h-[22px] w-[22px] stroke-[1.5]" />

                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 z-50 -translate-y-1/2 translate-x-2 scale-90 opacity-0 rounded-md bg-zinc-900 border border-white/10 px-2 py-1 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover/btn:translate-x-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 whitespace-nowrap">
                    {label}
                </div>
            </button>
        </div>
    )
}
