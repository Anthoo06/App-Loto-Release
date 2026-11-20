// Pont minimal entre l'app et Windows : ouvrir un lien dans le navigateur (mise à jour).
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("LotoDesktop", {
  openUrl: url => ipcRenderer.send("open-url", String(url))
});
