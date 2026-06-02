import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "Codingo - Learn Coding the Gamified Way!",
  description:
    "Codingo-style gamified coding platform. Master Python, JavaScript, and other languages with bite-sized lessons, streaks, and XP points.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background antialiased overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
