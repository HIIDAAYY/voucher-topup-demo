import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";
import { ToastProvider } from "@/components/shared/Toast";
import { DemoBadge } from "@/components/layout/DemoBadge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GacorStore — Top Up Game Murah, Cepat, Terpercaya",
  description: "Demo top up voucher game — simulasi, bukan transaksi sungguhan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-foreground">
        <ToastProvider>
          <TransactionProvider>
            <DemoBadge />
            <Header />
            {children}
            <Footer />
          </TransactionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
