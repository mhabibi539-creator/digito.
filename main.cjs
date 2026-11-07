'use strict';
const { app, BrowserWindow, Menu, dialog, shell, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_TITLE = 'DIGITO PREMIUM';
let mainWindow;

function isLocalAppUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'file:' && u.pathname.toLowerCase().endsWith('/app/index.html');
  } catch { return false; }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 900,
    minHeight: 650,
    show: false,
    title: APP_TITLE,
    icon: path.join(__dirname, 'assets', 'digito-icon.ico'),
    autoHideMenuBar: false,
    backgroundColor: '#f4f6fb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      spellcheck: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isLocalAppUrl(url)) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === 'p') {
      event.preventDefault();
      mainWindow.webContents.print({ printBackground: true });
    }
    if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
      event.preventDefault();
      mainWindow.webContents.reload();
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function buildMenu() {
  const template = [
    {
      label: 'فایل',
      submenu: [
        { label: 'چاپ', accelerator: 'Ctrl+P', click: () => mainWindow?.webContents.print({ printBackground: true }) },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' }
      ]
    },
    {
      label: 'ویرایش',
      submenu: [
        { role: 'undo', label: 'بازگردانی' },
        { role: 'redo', label: 'انجام دوباره' },
        { type: 'separator' },
        { role: 'cut', label: 'برش' },
        { role: 'copy', label: 'کپی' },
        { role: 'paste', label: 'جای‌گذاری' },
        { role: 'selectAll', label: 'انتخاب همه' }
      ]
    },
    {
      label: 'نما',
      submenu: [
        { role: 'reload', label: 'بارگذاری مجدد' },
        { role: 'togglefullscreen', label: 'تمام‌صفحه' },
        { role: 'zoomIn', label: 'بزرگ‌نمایی' },
        { role: 'zoomOut', label: 'کوچک‌نمایی' },
        { role: 'resetZoom', label: 'اندازه پیش‌فرض' },
        { role: 'toggleDevTools', label: 'ابزار توسعه‌دهندگان' }
      ]
    },
    {
      label: 'راهنما',
      submenu: [
        { label: 'درباره DIGITO PREMIUM', click: () => dialog.showMessageBox(mainWindow, {
          type: 'info', title: 'درباره برنامه', message: APP_TITLE,
          detail: 'نسخه دسکتاپ ویندوز 3.4.0\nاطلاعات برنامه در پروفایل محلی ویندوز نگهداری می‌شود.'
        }) }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Give every generated file a native Windows Save As dialog.
session.defaultSession.on('will-download', async (event, item) => {
  item.pause();
  const suggested = item.getFilename() || 'digito-file';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'ذخیره فایل خروجی',
    defaultPath: path.join(app.getPath('downloads'), suggested),
    buttonLabel: 'ذخیره'
  });
  if (result.canceled || !result.filePath) {
    item.cancel();
    return;
  }
  item.setSavePath(result.filePath);
  item.resume();
});

app.whenReady().then(() => {
  app.setAppUserModelId('ir.digito.premium');
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
