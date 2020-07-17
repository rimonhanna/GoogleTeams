/* All window creation functions */
const path = require("path");
const fs = require("fs");
const { BrowserWindow, BrowserView, ipcMain, screen, app, shell } = require("electron");
const windowStateKeeper = require("electron-window-state");

const GOOGLE_MEET_URL = "https://meet.google.com/";
const GOOGLE_CHAT_URL = "https://chat.google.com/";
const GOOGLE_CURRENTS_URL = "https://currents.google.com/";


function createMainWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800,
    fullScreen: false,
    maximize: true,
  });

  const mainWindow = (global.mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
    },
  }));
  mainWindowState.manage(mainWindow);
  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.on("did-finish-load", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.webContents.send("window.maximized");
    }
  });

  mainWindow.maximize();

  createGoogleCurrentsView(mainWindow);
  createGoogleMeetView(mainWindow);
  createGoogleChatView(mainWindow);

  ipcMain.on("window.meet", (event) => {
    mainWindow.setBrowserView(global.googleMeetView);
  });
  ipcMain.on("window.chat", (event) => {
    mainWindow.setBrowserView(global.googleChatView);
  });
  ipcMain.on("window.currents", (event) => {
    mainWindow.setBrowserView(global.googleCurrentsView);
  });

  let handleNavigation = function (event, url, frameName, disposition, options) {
    event.preventDefault();

    if (url.includes("meet.google")) {
      global.googleMeetView.webContents.loadURL(url);
      mainWindow.webContents.executeJavaScript("document.getElementById('meet-tab').click();");
    } else if (url.includes("currents.google")) {
      global.googleCurrentsView.webContents.loadURL(url);
      mainWindow.webContents.executeJavaScript("document.getElementById('currents-tab').click();");
    } else if (url.includes("chat.google")) {
      global.googleChatView.webContents.loadURL(url);
      mainWindow.webContents.executeJavaScript("document.getElementById('chat-tab').click();");
    } else {
      shell.openExternal(url);
    }
  };

  global.googleMeetView.webContents.on("new-window", handleNavigation);
  global.googleChatView.webContents.on("new-window", handleNavigation);
  global.googleCurrentsView.webContents.on("new-window", handleNavigation);


  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window.maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window.restored");
  });

  ipcMain.on("window.minimize", (event) => {
    mainWindow.minimize();
  });

  ipcMain.on("window.maximize", (event) => {
    mainWindow.maximize();
    event.sender.send("window.maximized");
  });

  ipcMain.on("window.restore", (event) => {
    mainWindow.restore();
    event.sender.send("window.restored");
  });

  ipcMain.on("window.close", () => {
    mainWindow.close();
  });

  let canvasWindow = createCanvasWindow();

  const screenToolsWindow = createScreenToolsWindow();

  // screenToolsWindow.moveAbove(canvasWindow.getMediaSourceId());

  ipcMain.on("window.screenshare.show", () => {
    mainWindow.minimize();
    screenToolsWindow.show();
  });

  ipcMain.on("window.screenshare.hide", () => {
    screenToolsWindow.hide();
    screenToolsWindow.reload();
    canvasWindow.hide();
  });

  ipcMain.on("window.canvas.show", () => {
    canvasWindow.show();
  });

  ipcMain.on("window.canvas.hide", () => {
    canvasWindow.hide();
    canvasWindow.reload();
  });

  ipcMain.on("window.main.focus", () => {
    mainWindow.restore();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    app.quit();
  });

  return mainWindow;
}

function createGoogleMeetView(mainWindow) {
  const googleMeetView = (global.googleMeetView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "..", "renderer", "adapters", "polyfill.js"),
    },
  }));

  let url = GOOGLE_MEET_URL;
  if (app.commandLine.hasSwitch("room-id")) {
    url = GOOGLE_MEET_URL + app.commandLine.getSwitchValue("room-id");
  }

  mainWindow.addBrowserView(googleMeetView);

  googleMeetView.webContents.loadURL(url);
  googleMeetView.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40,
  });
  googleMeetView.webContents.on("did-finish-load", () => {
    googleMeetView.webContents.insertCSS(fs.readFileSync(path.join(__dirname, "..", "renderer", "css", "screen.css")).toString());
  });
  // googleMeetView.webContents.openDevTools();

  mainWindow.on("resize", () => {
    googleMeetView.setBounds({
      x: 0,
      y: 40,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height - 40,
    });
  });

  ipcMain.on("window.home", () => {
    googleMeetView.webContents.loadURL(GOOGLE_MEET_URL);
  });

  ipcMain.on("screenshare.stop", () => {
    googleMeetView.webContents.send("screenshare.stop");
  });
}

function createGoogleChatView(mainWindow) {
  const googleChatView = (global.googleChatView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "..", "renderer", "adapters", "polyfill.js"),
    },
  }));

  let url = GOOGLE_CHAT_URL;
  if (app.commandLine.hasSwitch("room-id")) {
    url = GOOGLE_CHAT_URL + app.commandLine.getSwitchValue("room-id");
  }

  mainWindow.addBrowserView(googleChatView);

  googleChatView.webContents.loadURL(url);
  googleChatView.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40,
  });
  googleChatView.webContents.on("did-finish-load", () => {
    googleChatView.webContents.insertCSS(fs.readFileSync(path.join(__dirname, "..", "renderer", "css", "screen.css")).toString());
  });
  // googleChatView.webContents.openDevTools();

  mainWindow.on("resize", () => {
    googleChatView.setBounds({
      x: 0,
      y: 40,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height - 40,
    });
  });

  ipcMain.on("window.home", () => {
    googleChatView.webContents.loadURL(GOOGLE_CHAT_URL);
  });
}

function createGoogleCurrentsView(mainWindow) {
  const googleCurrentsView = (global.googleCurrentsView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "..", "renderer", "adapters", "polyfill.js"),
    },
  }));

  let url = GOOGLE_CURRENTS_URL;
  if (app.commandLine.hasSwitch("room-id")) {
    url = GOOGLE_CURRENTS_URL + app.commandLine.getSwitchValue("room-id");
  }

  mainWindow.addBrowserView(googleCurrentsView);

  googleCurrentsView.webContents.loadURL(url);
  googleCurrentsView.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40,
  });
  googleCurrentsView.webContents.on("did-finish-load", () => {
    googleCurrentsView.webContents.insertCSS(fs.readFileSync(path.join(__dirname, "..", "renderer", "css", "screen.css")).toString());
  });
  // googleCurrentsView.webContents.openDevTools();

  mainWindow.on("resize", () => {
    googleCurrentsView.setBounds({
      x: 0,
      y: 40,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height - 40,
    });
  });

  ipcMain.on("window.home", () => {
    googleCurrentsView.webContents.loadURL(GOOGLE_CURRENTS_URL);
  });
}

function createCanvasWindow() {
  const primaryWorkarea = screen.getPrimaryDisplay().bounds;
  const canvasWindow = new BrowserWindow({
    x: primaryWorkarea.x,
    y: primaryWorkarea.y,
    width: primaryWorkarea.width,
    height: primaryWorkarea.height,
    transparent: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
    },
    focusable: false,
    show: false,
    resizable: false,
    skipTaskbar: true,
  });
  canvasWindow.webContents.loadFile(path.join(__dirname, "..", "renderer", "canvas.html"));
  canvasWindow.setAlwaysOnTop(true, "pop-up-menu");
  return canvasWindow;
}

function createScreenToolsWindow() {
  const primaryWorkarea = screen.getPrimaryDisplay().bounds;
  const screenToolsWindow = new BrowserWindow({
    x: 100,
    y: primaryWorkarea.height - 200,
    height: 60,
    width: 300,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    focusable: false,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
    },
  });

  screenToolsWindow.setContentProtection(process.platform === "darwin");

  screenToolsWindow.webContents.loadFile(path.join(__dirname, "..", "renderer", "toolbar.html"));
  screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
  return screenToolsWindow;
}

module.exports = { createMainWindow };