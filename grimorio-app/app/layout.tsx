import type { Metadata, Viewport } from "next";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Grimório",
    template: "%s · Grimório",
  },
  description:
    "Leitor PWA para e-books e quadrinhos com catálogos da comunidade.",
  applicationName: "Grimório",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/manifest-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Grimório",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className="dark h-full antialiased"
    >
      <body className="min-h-full bg-black">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}