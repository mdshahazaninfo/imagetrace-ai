import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ImageTrace AI",
  description: "Privacy-aware reverse image source and public-web presence intelligence"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell"><Nav />{children}<footer>ImageTrace AI · Source intelligence, not biometric identity.</footer></div></body></html>;
}
