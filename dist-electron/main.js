var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { dialog, app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readdir, readFile } from "fs/promises";
import { extname, join } from "path";
class FileSelector {
  async run() {
    const result = await dialog.showOpenDialog(
      {
        properties: ["openDirectory"]
      }
    );
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }
}
class FilesHelper {
  constructor(folderPath) {
    this.folderPath = folderPath;
  }
  /**
   * Scans the directory and returns file names that match given extensions.
   * @param extensions - Array of file extensions to filter (e.g., ['.txt', '.json'])
   */
  async scanDirectory(extensions) {
    try {
      const files = await readdir(this.folderPath, { withFileTypes: true });
      return files.filter(
        (dirent) => dirent.isFile() && extensions.includes(extname(dirent.name))
      ).map((dirent) => join(this.folderPath, dirent.name));
    } catch (error) {
      console.error("Error reading directory:", error);
      return [];
    }
  }
  /**
   * Reads and returns the content of a file using its full file path.
   * @param fullFilePath - The absolute or relative path to the file
   */
  async getFileContent(fullFilePath) {
    try {
      const content = await readFile(fullFilePath, "utf-8");
      return content;
    } catch (error) {
      console.error(`Error reading file "${fullFilePath}":`, error);
      return "";
    }
  }
}
class Php {
  constructor() {
    __publicField(this, "content", "");
  }
  setContent(content) {
    this.content = content;
  }
  /**
   * Extracts all function names from the PHP content, both global and within classes.
   */
  async getFunctions(startsWith = null) {
    const result = [];
    const functionRegex = /function\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(this.content)) !== null) {
      const functionName = match[1];
      if (!startsWith || functionName.startsWith(startsWith)) {
        result.push(functionName);
      }
    }
    return result;
  }
  /**
   * Extracts all class names from the PHP content.
   */
  async getClass() {
    const result = [];
    const classRegex = /class\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)/g;
    let match;
    while ((match = classRegex.exec(this.content)) !== null) {
      result.push(match[1]);
    }
    return result;
  }
  /**
   * Extracts the full body of a class or function by name.
   * @param type "class" or "function"
   * @param name name of the class or function
   */
  async getBody(type, name) {
    const pattern = type === "class" ? new RegExp(`class\\s+${name}\\b[^\\{]*\\{`, "g") : new RegExp(`function\\s+${name}\\b[^\\{]*\\{`, "g");
    const match = pattern.exec(this.content);
    if (!match || match.index === void 0) return "";
    const startIndex = match.index;
    const openBraceIndex = this.content.indexOf("{", match.index);
    if (openBraceIndex === -1) return "";
    let braceCount = 1;
    let endIndex = openBraceIndex + 1;
    while (endIndex < this.content.length && braceCount > 0) {
      if (this.content[endIndex] === "{") braceCount++;
      else if (this.content[endIndex] === "}") braceCount--;
      endIndex++;
    }
    return this.content.slice(startIndex, endIndex);
  }
}
class SourceCode {
  async run(event, action, sourcePath, functionName) {
    if (action === "list-files") {
      return this.listFiles(sourcePath);
    }
    if (action === "list-identifiers") {
      const filesUtil = new FilesHelper(sourcePath);
      const php = new Php();
      php.setContent(await filesUtil.getFileContent(sourcePath));
      return await php.getFunctions();
    }
    if (action === "fetch-function-body") {
      const filesUtil = new FilesHelper(sourcePath);
      const php = new Php();
      php.setContent(await filesUtil.getFileContent(sourcePath));
      return await php.getBody("function", functionName);
    }
    return [];
  }
  async listFiles(sourcePath) {
    const filesUtil = new FilesHelper(sourcePath);
    return await filesUtil.scanDirectory([".php"]);
  }
}
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
const sourceCodeHandler = new SourceCode();
ipcMain.handle("select-folder", new FileSelector().run);
ipcMain.handle("source-code", (event, ...args) => sourceCodeHandler.run(event, ...args));
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
