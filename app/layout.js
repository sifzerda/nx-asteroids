import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/authContext";
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Asteroids",
  description: "A game of Asteroids built with React Next",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>

      <body className="min-h-full flex flex-col">

        <AuthProvider>

          <Header />

          <Navigation />

          <main className="flex-1 flex flex-col mx-2 mb-2 rounded-md neon-cyan gradient-border overflow-hidden">
            {children}
          </main>
 
          <Footer />
        </AuthProvider>

      </body>
    </html>
  );
}