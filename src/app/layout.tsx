import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VoiceAssistantLoader } from "@/views/components/VoiceAssistantLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biometric KYC — Secure Identity Verification",
  description: "Face authentication, document OCR, and AI-guided onboarding in one seamless flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          {children}
          <VoiceAssistantLoader />
        </body>
    </html>
  );
}
