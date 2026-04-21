import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalContextProvider, {useGlobalContext} from "@/contexts/GlobalContext";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = localFont({
  src: "./fonts/DMSans[opsz,wght].woff2",
  variable: "--font-dm-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sistem Informasi Nama Rupabumi",
  description: "Sistem Informasi Nama Rupabumi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased font-dm-sans`}
      >
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
