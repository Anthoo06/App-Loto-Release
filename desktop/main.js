// App Loto pour PC : fenêtre qui affiche l'app (dossier www), sans connexion.
// Les données (localStorage) restent dans le dossier utilisateur de l'app et sont gardées lors des mises à jour.
const { app, BrowserWindow, shell, Menu, ipcMain, session, powerSaveBlocker } = require("electron");
const path = require("path");

if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1360, height: 880, minWidth: 820, minHeight: 600,
    title: "Loto", backgroundColor: "#f6efe9", autoHideMenuBar: true,
    icon: path.join(__dirname, "www", "icons", "icon-512.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, nodeIntegration: false }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "www", "index.html"));
  // liens externes (téléchargement d'une mise à jour…) : navigateur par défaut
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) { e.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); } });
  // F11 : plein écran ; Ctrl+R : recharger
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.control && input.key.toLowerCase() === "r") { win.reload(); e.preventDefault(); }
  });
}
// écran allumé pendant le jeu (réglage « Économie » ou « Toujours allumé »)
let blocker = null;
ipcMain.on("keep-awake", (e, on) => {
  if (on && blocker === null) blocker = powerSaveBlocker.start("prevent-display-sleep");
  else if (!on && blocker !== null) { powerSaveBlocker.stop(blocker); blocker = null; }
});
ipcMain.on("open-url", (e, url) => { if (/^https:\/\/github\.com\//.test(url)) shell.openExternal(url); });
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  // seule autorisation donnée à la page : la caméra (scan en direct des cartons)
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === "media"));
  session.defaultSession.setPermissionCheckHandler((wc, perm) => perm === "media");
  createWindow();
});
app.on("window-all-closed", () => app.quit());
