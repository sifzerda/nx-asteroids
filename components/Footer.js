// components/Footer.js
'use client';

import { FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white border-t border-blue-900">
            <div className="flex flex-col items-center py-8">

                {/* Top line */}
                <div className="w-full h-[2px] bg-cyan-500 mb-6"></div>

                <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span>sifzerda</span>

                    <a
                        href="https://github.com/sifzerda/nx-asteroids"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition">
                        <FaGithub className="text-base" />
                    </a>

                    <span>2026</span>
                </p>

                {/* Bottom blue line */}
                <div className="w-full h-[2px] bg-blue-900 mt-6"></div>
            </div>
        </footer>
    );
}