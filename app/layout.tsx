import type { Metadata } from "next";

import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import TopBar from "@/components/TopBar";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Keilim",
  description: "Tevilas Keilim reference kiosk",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased pb-[env(safe-area-inset-bottom)]">
        <ServiceWorkerRegistrar />
        <TopBar />
        <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4">{children}</main>
        <footer className="border-t">
          <div className="mx-auto w-full max-w-4xl px-3 py-4 text-sm text-gray-600 sm:px-4">
            Copyright {new Date().getFullYear()} Keilim. Educational use only; always ask a Rav for psak.
          </div>
        </footer>
      </body>
    </html>
  );
}
