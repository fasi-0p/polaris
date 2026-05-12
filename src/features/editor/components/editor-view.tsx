import { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";

import { TopNavigation } from "./top-navigation";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { CodeEditor } from "./code-editor";

import { useEditor } from "@/features/editor/hooks/use-editor";
import { useFile } from "@/features/projects/hooks/use-files";

interface EditorViewProps {
  projectId: Id<"projects">;
}

export const EditorView = ({ projectId }: EditorViewProps) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>

      {activeTabId && <FileBreadcrumbs projectId={projectId} />}

      <div className="flex-1 min-h-0 bg-background">
        {!activeFile ? (
          <div className="size-full flex items-center justify-center">
            <Image
              src="/vercel.svg"
              alt="logo"
              width={50}
              height={50}
              className="opacity-25"
            />
          </div>
        ) : (
          <CodeEditor fileName={activeFile.name} />
        )}
      </div>
    </div>
  );
};