import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./util/Navbar";
import { AuthProvider } from "./util/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MindMap",
  description: "A spanish language learning app for the University of Florida",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main style={{ marginTop: "60px" }}>
			<AuthProvider>
				{children}
			</AuthProvider>
		</main>
      </body>
    </html>
  );
}
