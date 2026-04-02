import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boston Nest | 波士顿精选租房",
  description: "面向波士顿华人留学生与职场人士的高品质租房平台。"
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
