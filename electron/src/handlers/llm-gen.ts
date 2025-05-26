import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import ElectronHandler from "../electron-handler";


export default class LLMGenHandler implements ElectronHandler {
    async run(event: Electron.CrossProcessExports.IpcMainInvokeEvent, action: string, content: string): Promise<unknown> {
        if (action === 'post-process-function') {
            return await this.postProcessFunction(content)
        }
        if (action === 'generate-flow') {
            return await this.generateFlow(content)
        }
        throw new Error(`Action ${action} is not supported by LLMGenHandler`);
    }

    async postProcessFunction(content: string): Promise<{ [key: string]: unknown }> {
        const schema = z.object({
            functionName: z.string(),
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
        const response = await structuredModel.invoke(`
            You are an AI assistant that helps developers understand and document their code.
            You will be given a function body and you need to provide a summary of the function,
            the function name, and any other functions it calls.
            function body: ${content}`);

        // This function can be used to post-process the content after generation
        // For example, you could format the content or apply some transformations
        return response;
    }

    async generateFlow(content: string): Promise<{[key: string]: unknown}> {
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

    private getAiInstance() {
        const model = new ChatGroq({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            apiKey: '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',
        });
        return model;
    }
}