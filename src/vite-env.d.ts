/// <reference types="vite/client" />

interface ElectronAPI {
    connectSSH: (id: string, config: any) => Promise<{ status: string, id: string }>
    disconnectSSH: (id: string) => void
    writeSSH: (id: string, data: string) => void
    resizeSSH: (id: string, rows: number, cols: number) => void
    onSSHData: (callback: (event: any, data: { id: string, data: string }) => void) => () => void
    onSSError: (callback: (event: any, error: any) => void) => () => void
    onSSHClosed: (callback: (event: any, id: string) => void) => () => void

    minimize: () => void
    maximize: () => void
    close: () => void

    encrypt: (text: string) => Promise<string>
    decrypt: (encryptedBase64: string) => Promise<string>
}

interface Window {
    electronAPI: ElectronAPI
}
