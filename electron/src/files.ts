import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

export default class FilesHelper {
    constructor(private folderPath: string) {}

    /**
     * Scans the directory and returns file names that match given extensions.
     * @param extensions - Array of file extensions to filter (e.g., ['.txt', '.json'])
     */
    async scanDirectory(extensions: string[]): Promise<string[]> {
        try {
            const files = await readdir(this.folderPath, { withFileTypes: true });
            return files
                .filter(dirent => 
                    dirent.isFile() &&
                    extensions.includes(extname(dirent.name))
                )
                .map(dirent =>  join(this.folderPath, dirent.name));
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
            const content = await readFile(fullFilePath, 'utf-8');
            return content;
        } catch (error) {
            console.error(`Error reading file "${fullFilePath}":`, error);
            return '';
        }
    }
}
