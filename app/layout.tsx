import "./globals.css";
import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";

// GoldRush brand typefaces (same as goldrush.dev): Inter for UI/body,
// IBM Plex Mono for numbers, tickers and labels.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "GoldRush Vault Explorer",
    description: "Recursively decompose any EVM vault into its underlying token holdings with live USD values.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
