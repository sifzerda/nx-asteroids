// components/Footer.js
'use client';

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white border-t border-blue-900">
            <div className="flex flex-col items-center py-8">

                {/* Top gold line */}
                <div className="w-full h-[2px] bg-cyan-500 mb-6"></div>

                <p className="text-sm text-gray-400 mb-1">sifzerda
                    <span>
                        <a
                            href="https://github.com/sifzerda/nx-asteroids"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-3 hover:text-gray-400 transition"
                        > 🚀 </a>
                    </span>
                    {/* Year */}
                    2026</p>

                {/* Bottom blue line */}
                <div className="w-full h-[2px] bg-blue-900 mt-6"></div>
            </div>
        </footer>
    );
}