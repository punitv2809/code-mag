import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import FlowMaker from "./FlowMaker";

type FunctionContent = {
  functionName: string,
  content: string,
  parameters?: { name: string, type?: string, description?: string }[],
  returnType?: string,
  summary: string,
  calls: string[],
  isMethod?: boolean,
  className?: string,
  controlFlow?: {
    type: "if" | "loop" | "switch" | "try" | "other",
    condition?: string,
    description?: string
  }
}

type SetupWithSourceCode = {
  path: string,
  sourceCode: FunctionContent[]
}[]

const File = ({
  title,
  value,
  onFunctionToggle,
  selectedFunctions,
}: {
  title: string;
  value: string;
  onFunctionToggle: (file: string, fn: string, checked: boolean) => void;
  selectedFunctions: string[];
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
        {functions.map((fn) => (
          <div
            key={fn}
            className="p-1 px-2 rounded-sm flex items-center justify-start gap-2"
          >
            <Checkbox
              checked={selectedFunctions.includes(fn)}
              onCheckedChange={(checked) =>
                onFunctionToggle(title, fn, !!checked)
              }
            />
            <p className="italic">{fn} ( )</p>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};


const SourceSetup = ({ folderPath }: { folderPath: string }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [setup, setSetup] = useState<Record<string, string[]>>({});
  const [tmpMove, setTmpMove] = useState<boolean>(false)
  const [diagram, setDiagram] = useState<{}>({})


  const [isNextLoading, setIsNextLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await window.ipcRenderer.invoke(
        "source-code",
        "list-files",
        folderPath
      );
      setFiles(files);
    };
    fetchFiles();
  }, [folderPath]);

  const handleFunctionToggle = (
    file: string,
    fn: string,
    checked: boolean
  ) => {
    setSetup((prev) => {
      const currentFns = prev[file] || [];
      if (checked) {
        return {
          ...prev,
          [file]: [...new Set([...currentFns, fn])],
        };
      } else {
        const updatedFns = currentFns.filter((name) => name !== fn);
        const updated = { ...prev };
        if (updatedFns.length > 0) {
          updated[file] = updatedFns;
        } else {
          delete updated[file];
        }
        return updated;
      }
    });
  };

  const prepareSourceCode = async () => {
    if (isNextLoading || Object.keys(setup).length === 0) return;
    setIsNextLoading(true)

    const setupContent: SetupWithSourceCode = []

    for (const file in setup) {
      const functions = setup[file]
      const contents = await Promise.all(
        functions.map(async (fn) => {
          const functionBody = await window.ipcRenderer.invoke("source-code", 'fetch-function-body', file, fn);
          const metadata: { [key: string]: string } = await window.ipcRenderer.invoke("llm-gen", 'post-process-function', functionBody)
          return { functionName: fn, content: functionBody, ...metadata };
        })
      );
      setupContent.push({ path: file, sourceCode: contents })
      setDiagram(await window.ipcRenderer.invoke("llm-gen", 'generate-flow', JSON.stringify(contents, null, 2)))
    }
    setIsNextLoading(false)
    setTmpMove(true)
  }

  if (tmpMove && diagram) {
    return <FlowMaker flowDiagram={diagram} />
  }

  return (
    <div className="w-full h-full overflow-x-hidden">
      <div className="border-b h-16 flex items-center justify-start px-3">
        <p className="text-sm font-medium">{folderPath}</p>
        <div className="grow" />
        <Button size="sm" onClick={prepareSourceCode} disabled={isNextLoading}>
          Next {isNextLoading ? <svg className="ml-1 size-4 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <ChevronRight />}
        </Button>
      </div>
      <div className="p-3 space-y-2">
        {files.map((file, idx) => (
          <Accordion key={file} type="single" collapsible>
            <File
              title={file}
              value={`${file}-${idx}`}
              onFunctionToggle={handleFunctionToggle}
              selectedFunctions={setup[file] || []}
            />
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default SourceSetup;
