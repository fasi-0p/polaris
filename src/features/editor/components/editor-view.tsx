import {Id} from "../../../../convex/_generated/dataModel"
import {TopNavigation} from "./top-navigation"
import {FileBreadcrumbs} from "./file-breadcrumbs"
import {useEditor} from "@/features/editor/hooks/use-editor"


export const EditorView=({projectId}:{projectId: Id<"projects">})=>{
    const {activeTabId}=useEditor(projectId)

    return (
        <div className='h-full flex flex-col'>
            <div className='flex items-center'>
                <TopNavigation projectId={projectId}/>
            </div>
            {activeTabId &&<FileBreadcrumbs projectId={projectId}/>}
        </div>
    )
}