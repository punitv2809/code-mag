import FilesHelper from "../files";
import ElectronHandler from "../electron-handler";
import Php from "../languages/php";

export default class SourceCode implements ElectronHandler {
    async run(event: Electron.CrossProcessExports.IpcMainInvokeEvent, action:string, sourcePath:string, functionName?:string): Promise<string[]|string> {
        if (action === 'list-files') {
            return this.listFiles(sourcePath)
        }
        
        if (action === 'list-identifiers') {
            const filesUtil = new FilesHelper(sourcePath)
            const php = new Php()
            php.setContent(await filesUtil.getFileContent(sourcePath))
            return await php.getFunctions()
        }

        if(action === 'fetch-function-body') {
            const filesUtil = new FilesHelper(sourcePath)
            const php = new Php()
            php.setContent(await filesUtil.getFileContent(sourcePath))
            return await php.getBody('function', functionName!)
        }
        
        return []
    }

    async listFiles(sourcePath:string): Promise<string[]> {
        const filesUtil = new FilesHelper(sourcePath)
        return await filesUtil.scanDirectory(['.php'])
    }
}