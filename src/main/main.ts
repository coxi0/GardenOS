import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerPlanteHandlers } from './ipc/plante.handlers';
import { registerStockHandlers } from './ipc/stock.handlers';
import { registerJardinHandlers } from './ipc/jardin.handlers';
import { registerRefsHandlers } from './ipc/refs.handlers';
import { disconnectDb } from './services/db.service';

if (started) {
  app.quit();
}

const ANGULAR_DEV_URL = 'http://localhost:4200';
const ANGULAR_DIST = path.join(__dirname, '../../renderer/dist/app/browser/index.html');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL(ANGULAR_DEV_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(ANGULAR_DIST);
  }
};

app.on('ready', () => {
  registerPlanteHandlers();
  registerStockHandlers();
  registerJardinHandlers();
  registerRefsHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await disconnectDb();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
