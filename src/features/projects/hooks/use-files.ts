import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {Id} from "../../../../convex/_generated/dataModel"

export const useCreateFile =()=>{
    return useMutation(api.files.createFile)
}

export const useCreateFolder=()=>{
    return useMutation(api.files.createFolder)
}