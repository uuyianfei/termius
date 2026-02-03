import { app, BrowserWindow, ipcMain, safeStorage } from 'electron'
import path from 'node:path'
import { Client } from 'ssh2'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null

// Store active SSH sessions: sessionId -> client instance
const sshSessions = new Map<string, Client>()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Frameless window
    titleBarStyle: 'hidden', // Hide default title bar but keep window controls overlay if needed (or custom)
    // Windows Acrylic/Mica effect
    backgroundMaterial: 'acrylic', 
    backgroundColor: '#00000000', // Transparent background to show acrylic effect
    vibrancy: 'fullscreen-ui', // macOS specific, but good to have
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false, // Required for some node integrations if not using contextIsolation carefully, but we are.
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Load the local URL for development or the local file for production.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


// --- SSH IPC Handlers ---

// Connect to SSH
ipcMain.handle('ssh-connect', (event, { id, config }) => {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    
    conn.on('ready', () => {
      sshSessions.set(id, conn)
      resolve({ status: 'connected', id })
    })

    conn.on('error', (err) => {
      reject(err)
    })

    conn.on('close', () => {
      sshSessions.delete(id)
      event.sender.send('ssh-closed', id)
    })

    // Handle data from server
    conn.on('data', (data: Buffer) => { // This might need to be hooked to shell
       // handled in shell
    })

    try {
      conn.connect(config)
      
      // We generally want a shell
      conn.on('ready', () => {
         conn.shell((err, stream) => {
            if (err) {
                event.sender.send('ssh-error', { id, error: err.message });
                return;
            }
            
            // Store stream reference if needed, or just attach listeners
            // For simplicity, we attach listeners here.
            // We might need a way to look up the stream by ID. 
            // Let's store the stream in the session map or a separate map.
            // To keep it simple, we attach the data listener to send IPC.
            
            stream.on('data', (data: Buffer) => {
                event.sender.send('ssh-data', { id, data: data.toString() })
            })
            
            stream.on('close', () => {
                conn.end()
            })

            // Allow writing to this stream from IPC
            sshSessions.set(id + '_stream', stream as any)
         })
      })

    } catch (error) {
      reject(error)
    }
  })
})

// Send data to SSH (keystrokes)
ipcMain.on('ssh-write', (event, { id, data }) => {
  const stream = sshSessions.get(id + '_stream') as any
  if (stream) {
    stream.write(data)
  }
})

// Resize terminal
ipcMain.on('ssh-resize', (event, { id, rows, cols }) => {
  const stream = sshSessions.get(id + '_stream') as any
  if (stream) {
    stream.setWindow(rows, cols, 0, 0)
  }
})

// Disconnect
ipcMain.on('ssh-disconnect', (event, id) => {
  const conn = sshSessions.get(id) as Client
  if (conn) {
    conn.end()
    sshSessions.delete(id)
    sshSessions.delete(id + '_stream')
  }
})

// --- SafeStorage IPC Handlers ---

ipcMain.handle('safe-encrypt', async (event, text) => {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(text).toString('base64')
  }
  throw new Error('Encryption not available')
})

ipcMain.handle('safe-decrypt', async (event, encryptedBase64) => {
  if (safeStorage.isEncryptionAvailable()) {
    const buffer = Buffer.from(encryptedBase64, 'base64')
    return safeStorage.decryptString(buffer)
  }
  throw new Error('Encryption not available')
})

// --- Window Controls IPC ---
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize()
    } else {
        mainWindow?.maximize()
    }
})
ipcMain.on('window-close', () => mainWindow?.close())
