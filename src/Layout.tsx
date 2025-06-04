import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import Blog from "./screens/Blog"

export default function Layout() {
    return (
        <SidebarProvider className="h-screen">
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b sticky top-0 z-20 bg-background/80 backdrop-blur" style={{ WebkitAppRegion: 'drag' }}
                >
                    <div style={{ WebkitAppRegion: 'no-drag' }} className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Building Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    {/* electron close, min, max buttons */}
                    <div style={{ WebkitAppRegion: 'no-drag' }} className="flex gap-2 px-6">
                        {/* Minimize */}
                        <div
                            onClick={() => window.ipcRenderer.send('window:minimize')}
                            className="bg-secondary hover:scale-105 transition-all h-4 w-4 rounded-sm cursor-pointer"
                        ></div>

                        {/* Maximize */}
                        <div
                            onClick={() => window.ipcRenderer.send('window:maximize')}
                            className="bg-secondary hover:scale-105 transition-all h-4 w-4 rounded-sm cursor-pointer"
                        ></div>

                        {/* Close */}
                        <div
                            onClick={() => window.ipcRenderer.send('window:close')}
                            className="bg-rose-500 hover:scale-105 transition-all h-4 w-4 rounded-sm cursor-pointer"
                        ></div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 h-full">
                    <Blog />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
