import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerTwin — Your career. Your next move.",
  description: "Understand your skill gaps, follow a personalized roadmap, and build career-ready evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#6d3df5",
              colorForeground: "#202440",
              colorBackground: "#ffffff",
              colorInput: "#f8f8fc",
              colorInputForeground: "#202440",
              borderRadius: "0.875rem",
              fontFamily: "var(--font-geist-sans)",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
