// components/Asteroids.js
'use client';

export default function Asteroids() {
    return (
        <header className="w-full bg-black text-white">
            <div className="flex flex-col items-center py-6">

                {/* Top suit */}
                <div className="text-blue-400 text-2xl md:text-3xl mb-1">♠</div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center gap-2">
                    <span className="text-red-500 text-2xl md:text-3xl">♦</span>
                    <span className="font-[UnifrakturCook]">solitaire</span>
                    <span className="text-red-500 text-2xl md:text-3xl">♥</span>
                </h1>

                {/* Bottom suit */}
                <div className="text-blue-400 text-2xl md:text-3xl mt-1">♣</div>

            </div>
        </header>
    );
}
