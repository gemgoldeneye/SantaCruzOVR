import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
