import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Boston - 波士顿留学生租房首选",
  description: "面向波士顿华人留学生与职场人士的高品质租房平台，提供真实房源与高性价比的住宿选择。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
