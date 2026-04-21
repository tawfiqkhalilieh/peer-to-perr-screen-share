import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Screen Share",
  description: "Share your iPad screen to your computer instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-gray-900 text-white selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
