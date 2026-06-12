import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { auth } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "brooky-tok",
    template: "%s · brooky-tok",
  },
  description: "A simple social platform for sharing your thoughts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0095F6",
};

const PUBLIC_PATHS = ["/signin", "/signup", "/pending-approval"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublicPath) {
    const session = await auth.api.getSession({ headers: headersList });
    if (session?.user && !(session.user as any).approved) {
      redirect("/pending-approval");
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
