import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // SSH
    connectSSH: (id: string, config: any) => ipcRenderer.invoke('ssh-connect', { id, config }),
    disconnectSSH: (id: string) => ipcRenderer.send('ssh-disconnect', id),
    writeSSH: (id: string, data: string) => ipcRenderer.send('ssh-write', { id, data }),
    resizeSSH: (id: string, rows: number, cols: number) => ipcRenderer.send('ssh-resize', { id, rows, cols }),
    onSSHData: (callback: (event: any, data: { id: string, data: string }) => void) => {
        ipcRenderer.on('ssh-data', callback)
        return () => ipcRenderer.removeListener('ssh-data', callback)
    },
    onSSError: (callback: (event: any, error: any) => void) => {
        ipcRenderer.on('ssh-error', callback)
        return () => ipcRenderer.removeListener('ssh-error', callback)
    },
    onSSHClosed: (callback: (event: any, id: string) => void) => {
        ipcRenderer.on('ssh-closed', callback)
        return () => ipcRenderer.removeListener('ssh-closed', callback)
    },

    // Window Controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),

    // Safe Storage
    encrypt: (text: string) => ipcRenderer.invoke('safe-encrypt', text),
    decrypt: (encryptedBase64: string) => ipcRenderer.invoke('safe-decrypt', encryptedBase64),
})
