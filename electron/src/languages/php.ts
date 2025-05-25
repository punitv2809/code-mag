import Reflection from "../reflection";

export default class Php implements Reflection {
    private content: string = '';

    setContent(content: string): void {
        this.content = content;
    }

    /**
     * Extracts all function names from the PHP content, both global and within classes.
     */
    async getFunctions(startsWith: string | null = null): Promise<string[]> {
        const result: string[] = [];
        const functionRegex = /function\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)\s*\(/g;

        let match: RegExpExecArray | null;
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
    async getClass(): Promise<string[]> {
        const result: string[] = [];
        const classRegex = /class\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)/g;

        let match: RegExpExecArray | null;
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
    async getBody(type: 'class' | 'function', name: string): Promise<string> {
        const pattern = type === 'class'
            ? new RegExp(`class\\s+${name}\\b[^\\{]*\\{`, 'g')
            : new RegExp(`function\\s+${name}\\b[^\\{]*\\{`, 'g');

        const match = pattern.exec(this.content);
        if (!match || match.index === undefined) return '';

        const startIndex = match.index;
        const openBraceIndex = this.content.indexOf('{', match.index);
        if (openBraceIndex === -1) return '';

        // Extract block using brace matching
        let braceCount = 1;
        let endIndex = openBraceIndex + 1;
        while (endIndex < this.content.length && braceCount > 0) {
            if (this.content[endIndex] === '{') braceCount++;
            else if (this.content[endIndex] === '}') braceCount--;
            endIndex++;
        }

        return this.content.slice(startIndex, endIndex);
    }
}
