import { dialog } from "electron";
import ElectronHandler from "../electron-handler";

export default class FileSelector implements ElectronHandler {
    async run():Promise<string|null> {
          const result = await dialog.showOpenDialog(
            {
              properties: ['openDirectory']
            }
          );
          if (result.canceled || result.filePaths.length === 0) {
            return null;
          }
          return result.filePaths[0]
    }
}