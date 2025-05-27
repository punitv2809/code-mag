import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";

const File = ({
    title,
    value,
    onFunctionToggle,
    selectedFunctions,
    result
}: {
    title: string;
    value: string;
    onFunctionToggle: (file: string, fn: string, checked: boolean) => void;
    selectedFunctions: string[];
    result: Record<string, { isDone: boolean; isFailed: boolean }> | null;
}) => {
    const [functions, setFunctions] = useState<string[]>([]);

    const getIdentifiers = async (filePath: string) => {
        const functions: string[] = await window.ipcRenderer.invoke(
            "source-code",
            "list-identifiers",
            filePath
        );
        setFunctions(functions);
    };

    const allSelected =
        functions.length > 0 &&
        functions.every((fn) => selectedFunctions.includes(fn));

    const handleSelectAllToggle = () => {
        functions.forEach((fn) => {
            onFunctionToggle(title, fn, !allSelected);
        });
    };

    return (
        <AccordionItem value={value}>
            <AccordionTrigger onClick={() => getIdentifiers(title)}>
                {title}
            </AccordionTrigger>
            <AccordionContent className="space-y-1 divide-y">
                {functions.length > 0 && (
                    <div className="flex justify-end pb-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSelectAllToggle}
                        >
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                )}
                {functions.map((fn) => {
                    const key = title + fn;
                    const status = result?.[key];
                    return (
                        <div
                            key={fn}
                            className="p-1 px-2 rounded-sm flex items-center justify-between gap-2"
                        >
                            <div className="flex gap-2">
                                <Checkbox
                                    checked={selectedFunctions.includes(fn)}
                                    onCheckedChange={(checked) =>
                                        onFunctionToggle(title, fn, !!checked)
                                    }
                                />
                                <p className="italic">{fn} ( )</p>
                            </div>
                            {status?.isDone && <Badge>success</Badge>}
                            {status?.isFailed && (
                                <Badge variant="destructive">error</Badge>
                            )}
                        </div>
                    );
                })}
            </AccordionContent>
        </AccordionItem>
    );
};

export default File