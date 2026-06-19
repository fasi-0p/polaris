import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {Id} from "../../../../convex/_generated/dataModel"

// Sort: folders first, then files, alphabetically within each group
const sortFiles = <T extends { type: "file" | "folder"; name: string }>(
  files: T[]
): T[] => {
  return [...files].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
};

export const useCreateFile =()=>{
    return useMutation(api.files.createFile)
}

export const useCreateFolder=()=>{
    return useMutation(api.files.createFolder)
}

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
  enabled?: boolean;
}) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip",
  );
};

export const useRenameFile =()=>{
    return useMutation(api.files.renameFile)
}

export const useDeleteFile=()=>{
    return useMutation(api.files.deleteFile)
}

export const useFiles = (projectId: Id<"projects"> | null) => {
  return useQuery(api.files.getFiles, projectId ? { projectId } : "skip");
};

export const useFile = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFile, fileId ? { id: fileId } : "skip");
};

export const useFilePath = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFilePath, fileId ? { id: fileId } : "skip");
};

export const useUpdateFile=()=>{
  return useMutation(api.files.updateFile)
}