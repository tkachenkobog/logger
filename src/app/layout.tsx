import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Logger",
	description: "Logg your data",
};

export default function RootLayout ({
	                                    children,
                                    }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
			<html lang="en">
			<body className={ `${ geistSans.variable } ${ geistMono.variable }` }>
			<Providers>
				{ children }
			</Providers>
			</body>
			</html>
	);
}
