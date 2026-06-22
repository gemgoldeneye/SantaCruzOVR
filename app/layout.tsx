import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/ovr-ui-server"; // side-effect: sets the OVR server context before any render / generateMetadata
import { OvrConfigProvider } from "@gelabs/ovr/ui/config";
import { getConfig, getCopy } from "@gelabs/ovr/ui/server";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MUNICIPALITY } from "@/lib/config/santa-cruz";
import { copy } from "@/lib/i18n/en";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${copy.app.name} — ${MUNICIPALITY.fullName}`,
    template: `%s · ${copy.app.name}`,
  },
  description: copy.app.description,
};

// Applies the saved/system theme before hydration to avoid a flash. This lives in
// the server-rendered layout (not a client component), so React never client-renders
// the <script> and won't warn about scripts inside React components.
const NO_FLASH_THEME = `(function(){try{var k="theme",t=localStorage.getItem(k)||"system",m=window.matchMedia("(prefers-color-scheme: dark)").matches,d=t==="dark"||(t==="system"&&m),e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server context already set by the side-effect import above; read it for the
  // client provider (config + pre-merged copy are plain JSON → safe across RSC).
  const config = getConfig();
  const copyResolved = getCopy();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <OvrConfigProvider config={config} copy={copyResolved}>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </OvrConfigProvider>
      </body>
    </html>
  );
}
