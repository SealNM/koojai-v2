import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", 
});

export const metadata: Metadata = {
  title: "KooJai (คู่ใจ) - เพื่อนคู่ใจ AI",
  description: "ระบบ AI เพื่อนฟังใจสำหรับนักเรียน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
             __html: `(function(){try{var d=document.documentElement,c=d.classList;d.classList.remove('light','dark');var e=localStorage.getItem('theme');if('system'===e||(!e&&true)){var t='(prefers-color-scheme: dark)',m=window.matchMedia(t);if(m.media!==t||m.matches){d.style.colorScheme='dark';c.add('dark')}else{d.style.colorScheme='light';c.add('light')}}else if(e){c.add(e|| '')}if(e==='light'||e==='dark')d.style.colorScheme=e}catch(e){}})()`
          }}
        />
      </head>
      <body
        className={`${kanit.className} antialiased bg-gray-50 dark:bg-[#0f0d1a] text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen font-kanit`}
      >
        <ThemeProvider>
          <AuthProvider>
              {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
