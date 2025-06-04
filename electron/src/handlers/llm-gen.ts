import { z } from 'zod';
import store from './../Db/json-db';
import { ChatGroq } from '@langchain/groq';
import ElectronHandler from "../electron-handler";


export default class LLMGenHandler implements ElectronHandler {
    async run(event: Electron.CrossProcessExports.IpcMainInvokeEvent, action: string, content: string, filePath:string, key:string): Promise<unknown> {
        if (action === 'post-process-function') {
            const id = `${filePath}_${key}`;
            if (store.has(id)) {
                console.log("from cache", id)
                return store.get(id)
            }
            const result = await this.postProcessFunction(content)
            console.log("saved to cache", id)
            store.save(id, result)
            return result
        }
        if (action === 'generate-flow') {
            return await this.generateFlow(content)
        }
        if (action === 'generate-blog') {
            return await this.generateBlog(content)
        }
        throw new Error(`Action ${action} is not supported by LLMGenHandler`);
    }

    async postProcessFunction(content: string): Promise<{ [key: string]: unknown }|boolean> {
        const schema = z.object({
            fnName: z.string(),
            parameters: z.array(
                z.object({
                    name: z.string(),
                    type: z.string().optional(),
                    description: z.string().optional(),
                })
            ),
            returnType: z.string().optional(),
            summary: z.string(),
            calls: z.array(z.string()),
            isMethod: z.boolean().default(false),
            className: z.string().optional().default(''),
            controlFlow: z.array(
                z.object({
                    type: z.enum(["if", "loop", "switch", "try", "other"]),
                    condition: z.string().optional(),
                    description: z.string().optional(),
                })
            ).optional(),
        });

        const structuredModel = this.getAiInstance().withStructuredOutput(schema);
        const prompt = `
        You are an AI assistant that helps developers understand and document their code.
        You will be given a function body and you need to provide a summary of the function,
        the function name, and any other functions it calls.
        function body: ${content}`;

        const maxRetries = 3;
        const baseDelay = 2000; // in ms

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await structuredModel.invoke(prompt);
                return response;
            } catch (error: {message: string}) {
                console.error(`Attempt ${attempt} failed:`, error?.message || error);

                // Only retry if not the last attempt
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    console.error(`All ${maxRetries} attempts failed for content:`, content.substring(0, 50));
                }
            }
        }

        // If all retries fail, return empty result
        return false;
    }

    async generateFlow(content: string): Promise<{ [key: string]: unknown }> {
        const nodeSchema = z.object({
            id: z.string(),
            type: z.string(),
            position: z.object({
                x: z.number(),
                y: z.number(),
            }),
            data: z.object({
                label: z.string(),
                subType: z.string(),
            }),
        });

        const edgeSchema = z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            label: z.string(),
            animated: z.boolean(),
            type: z.string(),
        });

        const flowDiagramSchema = z.object({
            nodes: z.array(nodeSchema),
            edges: z.array(edgeSchema),
        });

        const structuredModel = this.getAiInstance().withStructuredOutput(flowDiagramSchema);
        const response = await structuredModel.invoke(`Generate a flow as a flow diagram with nodes and edges.
            input: ${content}`);

        return response;
    }

    async generateBlog(content:string): Promise<{ [key: string]: unknown }>{
        const blogSchema = z.object({
            title: z.string(),
            content: z.string()
        });

        const structuredModel = this.getAiInstance().withStructuredOutput(blogSchema);
        const response = await structuredModel.invoke(`Generate a high quality long blog, including flow for the code given below.
            input: ${content}`);

        return response; 
    }

    private getAiInstance() {
        const model = new ChatGroq({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            apiKey: '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',
        });
        return model;
    }
}