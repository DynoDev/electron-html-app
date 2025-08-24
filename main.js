const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('node:path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 500,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        }
    });

    mainWindow.loadFile("index.html");

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
      });

    // Minimize and close window
    ipcMain.on("minimize-window", () => {
        mainWindow.minimize();
    });

    ipcMain.on("close-window", () => {
        mainWindow.close();
    });

    // Handle macOS behavior to keep app open
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
});