export default interface Reflection {
    setContent(content: string): void;

    /**
     * Extracts function names, optionally filtered by prefix.
     * @param startsWith optional string to filter function names
     */
    getFunctions(startsWith?: string | null): Promise<string[]>;

    /**
     * Extracts all class names from the content.
     */
    getClass(): Promise<string[]>;

    /**
     * Extracts the full body of a class or function by name.
     * @param type 'class' or 'function'
     * @param name name of the class or function
     */
    getBody(type: 'class' | 'function', name: string): Promise<string>;
}
