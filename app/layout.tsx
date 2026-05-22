import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GoldRush Vault Explorer",
    description: "Recursively decompose any EVM vault into its underlying token holdings with live USD values.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
