import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

export default class FilesHelper {
    constructor(private folderPath: string) { }

    /**
     * Scans the directory and returns file names that match given extensions.
     * @param extensions - Array of file extensions to filter (e.g., ['.txt', '.json'])
     */
    async scanDirectory(extensions: string[]): Promise<string[]> {
        const result: string[] = [];

        async function walk(dir: string) {
            const entries = await readdir(dir, { withFileTypes: true }); // <- check this line
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
                    result.push(fullPath);
                }
            }
        }

        try {
            await walk(this.folderPath);
            return result;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }

    /**
     * Reads and returns the content of a file using its full file path.
     * @param fullFilePath - The absolute or relative path to the file
     */
    async getFileContent(fullFilePath: string): Promise<string> {
        try {
            const content = await readFile(fullFilePath, "utf-8");
            return content;
        } catch (error) {
            console.error(`Error reading file "${fullFilePath}":`, error);
            return "";
        }
    }
}
