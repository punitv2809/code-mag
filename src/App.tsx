import { useState } from "react"
import { CodeXml } from "lucide-react";
import { Button } from "./components/ui/button";
import SourceSetup from "./components/source-setup";
import { ThemeProvider } from "./components/ui/theme-provider";
import Layout from "./Layout";


const App = () => {
  const [folderPath, setFolderPath] = useState(null);

  const handleSelectFolder = async () => {
    const selectedPath = await window.ipcRenderer.invoke('select-folder')
    if (selectedPath) {
      setFolderPath(selectedPath)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <Layout />
      {/* <div className="bg-background text-foreground h-screen w-screen flex gap-2 flex-col items-center justify-center">
        {folderPath && <SourceSetup folderPath={folderPath} />}
        {!folderPath && <Button onClick={handleSelectFolder}><CodeXml /> Select Source Code</Button>}
      </div> */}
    </ThemeProvider >
  )
}

export default App
