'use client'
import {useMutation} from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {Button} from "@/components/ui/button";

const X = () => {
  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);

  return (
    <div className="flex flex-col gap-2 p-4">
      <Button onClick={()=> createProject({
        name: "New Project"
      })}>
        Add new
      </Button>

      {projects?.map((projects) => (
        <div
          className="border rounded p-2 flex flex-col"
          key={projects._id}
        >
          <p>{projects.name}</p>
          <p>Owner Id: {`${projects.ownerId}`}</p>
        </div>
      ))}
    </div>
  );
};

export default X;