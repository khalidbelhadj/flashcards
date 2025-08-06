import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("electron", electronAPI);
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
}
