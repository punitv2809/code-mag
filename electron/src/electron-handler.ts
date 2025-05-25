import { IpcMainInvokeEvent } from "electron";

export default interface ElectronHandler {
    run(event: IpcMainInvokeEvent, ...params: unknown[]): Promise<unknown>;
}