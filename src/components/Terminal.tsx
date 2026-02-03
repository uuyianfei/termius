import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
// Import CSS directly in main or here
import '@xterm/xterm/css/xterm.css'

interface TerminalComponentProps {
    sessionId: string
    onReady?: () => void
}

export function TerminalComponent({ sessionId, onReady }: TerminalComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermInstance = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

    useEffect(() => {
        if (!terminalRef.current) return

        // Initialize xterm.js
        const term = new XTerm({
            fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
            fontSize: 14,
            cursorBlink: true,
            cursorStyle: 'bar',
            theme: {
                background: '#1e1e2e', // Catppuccin Base or similar deep dark
                foreground: '#cdd6f4', // Text
                cursor: '#f5e0dc',
                selectionBackground: '#585b70',
                black: '#45475a',
                red: '#f38ba8',
                green: '#a6e3a1',
                yellow: '#f9e2af',
                blue: '#89b4fa',
                magenta: '#f5c2e7',
                cyan: '#94e2d5',
                white: '#bac2de',
                brightBlack: '#585b70',
                brightRed: '#f38ba8',
                brightGreen: '#a6e3a1',
                brightYellow: '#f9e2af',
                brightBlue: '#89b4fa',
                brightMagenta: '#f5c2e7',
                brightCyan: '#94e2d5',
                brightWhite: '#a6adc8',
            },
            allowProposedApi: true,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        fitAddonRef.current = fitAddon

        term.open(terminalRef.current)
        fitAddon.fit()
        xtermInstance.current = term

        // Focus terminal
        term.focus()

        // Handle incoming data from Electron
        const cleanupData = window.electronAPI.onSSHData((_event, { id, data }) => {
            if (id === sessionId) {
                term.write(data)
            }
        })

        // Handle user input
        term.onData((data) => {
            window.electronAPI.writeSSH(sessionId, data)
        })

        // Handle resize
        term.onResize(({ rows, cols }) => {
            window.electronAPI.resizeSSH(sessionId, rows, cols)
        })

        // Initial resize sync
        window.electronAPI.resizeSSH(sessionId, term.rows, term.cols)

        // Window resize observer
        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit()
            window.electronAPI.resizeSSH(sessionId, term.rows, term.cols)
        })
        resizeObserver.observe(terminalRef.current)

        if (onReady) onReady()

        return () => {
            cleanupData()
            resizeObserver.disconnect()
            term.dispose()
        }
    }, [sessionId])

    return (
        <div
            className="h-full w-full overflow-hidden bg-[#1e1e2e]"
            ref={terminalRef}
        />
    )
}
