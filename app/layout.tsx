import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastebin Lite - Share Code Beautifully",
  description: "Modern, secure text sharing with style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        {children}
      </body>
    </html>
  );
}
