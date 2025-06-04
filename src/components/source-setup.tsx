import File from "./Setup/File";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Accordion } from "./ui/accordion";
import { ChevronRight } from "lucide-react";

type FunctionContent = {
  fnName: string,
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
} | object

type SetupWithSourceCode = {
  path: string,
  metadata: FunctionContent[]
}[]

const SourceSetup = ({ folderPath }: { folderPath: string }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [setup, setSetup] = useState<Record<string, string[]>>({});
  const [chunks, setChunks] = useState<SetupWithSourceCode | null>(null);
  const [result, setResult] = useState<Record<string, { isDone: boolean, isFailed: boolean }> | null>(null)


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
    setIsNextLoading(true);

    const setupContent: SetupWithSourceCode = [];

    for (const file in setup) {
      const functions = setup[file];
      const contents = await Promise.all(
        functions.map(async (fn) => {
          const functionBody = await window.ipcRenderer.invoke("source-code", 'fetch-function-body', file, fn);
          const metadata: { [key: string]: string } | false = await window.ipcRenderer.invoke("llm-gen", 'post-process-function', functionBody, file, fn);

          if (metadata === false) {
            setResult(prev => ({ ...prev, [file + fn]: { isDone: false, isFailed: true } }));
            return {};
          }

          setResult(prev => ({ ...prev, [file + fn]: { isDone: true, isFailed: false } }));
          return { functionName: fn, content: functionBody, ...metadata };
        })
      );

      if (contents !== undefined) {
        setupContent.push({ path: file, metadata: contents });
      }
    }

    setChunks(setupContent);
    setIsNextLoading(false);
  };


  return (
    <div className="w-full h-full overflow-x-hidden">
      <div className="border-b h-16 flex items-center justify-start px-3">
        <p className="text-sm font-medium">{folderPath}</p>
        <div className="grow" />
        <Button size={'sm'} onClick={async () => console.log(await window.ipcRenderer.invoke("llm-gen", 'generate-blog', JSON.stringify(chunks)))}>test</Button>
        <Button size="sm" onClick={prepareSourceCode} disabled={isNextLoading}>
          Next {isNextLoading ? <svg className="ml-1 size-4 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <ChevronRight />}
        </Button>
      </div>
      <div className="p-3 space-y-2">
        {files.map((file, idx) => {
          const fileFunctions = setup[file] || [];
          return (
            <Accordion key={file} type="single" collapsible>
              <File
                title={file}
                value={`${file}-${idx}`}
                onFunctionToggle={handleFunctionToggle}
                selectedFunctions={fileFunctions}
                result={result}
              />
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default SourceSetup;
