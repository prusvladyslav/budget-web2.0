import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BurgerMenu } from "@/components/common/BurgerMenu";

const font = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget web",
  description: "Expenses tracking app. Main page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={font.className}>
          <main className="flex h-screen w-full">
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <SignedOut>
                <div className="w-full h-full flex justify-center items-center">
                  <SignInButton />
                </div>
              </SignedOut>
              <SignedIn>
                {children}
                <SpeedInsights />
              </SignedIn>
            </div>
            <Toaster />
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
