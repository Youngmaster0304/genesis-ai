import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genesis AI — The Autonomous Innovation Organization",
  description: "Transform unstructured ideas, whiteboard sketches, PDFs, and audio recordings into professional, validated R&D packages using parallel AI specialist agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-[#080B14] text-[#F1F5F9] flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-background to-background -z-50 pointer-events-none" />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
