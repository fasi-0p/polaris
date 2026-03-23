import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils" // assuming you're using a cn utility
import { Id } from "../../../../../convex/_generated/dataModel"
import { useProject } from "../../hooks/use-projects"


export const  FileExplorer = ({projectId}:{projectId: Id<'projects'>}) => {
  const [isOpen, setIsOpen] = useState(false)
  const project = useProject(projectId)

  return (
    <div className="h-full bg-sidebar">
      <ScrollArea>
        <div
          role="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-90"
            )}
          />
          <p className="text-xs uppercase line-clamp-1">
            {project?.name?? "Loading..."}
          </p>
        </div>
      </ScrollArea>
    </div>
  )
}