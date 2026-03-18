import React from 'react'
import { ProjectIdLayout } from "@/features/projects/components/project-id-layout"
import { Id } from "../../../../convex/_generated/dataModel"

const Layout = async ({
  children,
  params
}: {
  children: React.ReactNode
  params: { projectId: string }
}) => {
  const projectId = params.projectId as Id<"projects">

  return (
    <ProjectIdLayout projectId={projectId}>
      {children}
    </ProjectIdLayout>
  )
}

export default Layout