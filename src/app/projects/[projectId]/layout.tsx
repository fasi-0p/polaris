import React from 'react'
import { ProjectIdLayout } from "@/features/projects/components/project-id-layout"
import { Id } from "../../../../convex/_generated/dataModel"

const Layout = async ({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>  // ← Change to Promise<{...}>
}) => {
  const { projectId } = await params  // ← Await params
  console.log("projectId param:", projectId);
  return (
    <ProjectIdLayout projectId={projectId as Id<"projects">}>
      {children}
    </ProjectIdLayout>
  )
}

export default Layout