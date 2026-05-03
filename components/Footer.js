// components/Footer.js
'use client';

import { FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative w-full bg-black text-white border-t border-cyan-500/60 dual-border">

            <div className="flex flex-col items-center py-2">

                <p className="text-xs text-cyan-500 uppercase font-audiowide flex items-center gap-2">
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

            </div>
        </footer>
    );
}