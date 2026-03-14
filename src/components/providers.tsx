"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { ReactNode } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { UnauthenticatedView } from "@/features/auth/components/unauthenticated-view"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Authenticated>
            <UserButton/>
            {children}
          </Authenticated>

          <Unauthenticated>
            <UnauthenticatedView/> 
          </Unauthenticated>

          <AuthLoading>
            Auth Loading...
          </AuthLoading>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};