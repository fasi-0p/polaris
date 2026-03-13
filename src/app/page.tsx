'use client'

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const X = () => {
  const projects = useQuery(api.projects.get);

  return (
    <div className="flex flex-col gap-2 p-4">
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