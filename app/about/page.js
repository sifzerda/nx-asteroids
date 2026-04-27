// app/about.js
export default function AboutPage() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">

            <main className="flex flex-col flex-1 items-center justify-center bg-black text-cyan-200 py-18 px-16 font-mono relative overflow-hidden">

                {/* subtle starfield background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(white_1px,transparent_1px)] [background-size:40px_40px]" />
                </div>

                <div className="max-w-4xl mx-auto space-y-20 relative z-10">

                    {/* HEADER */}
                    <section className="text-center space-y-4">
                        <h1 className="text-5xl md:text-7xl tracking-[0.2em] text-cyan-300 drop-shadow-[0_0_12px_#00ffff]">
                            ABOUT
                        </h1>
                        <p className="uppercase text-sm md:text-base text-cyan-400 tracking-widest">React Next.js Asteroids 2.0</p>
                    </section>

                    {/* WHAT WE DO */}
                    <section className="space-y-6">
                        <h2 className="text-xl md:text-2xl text-cyan-300 tracking-widest">SYSTEM MODULES</h2>

                        <div className="grid md:grid-cols-3 gap-6">

                            {[
                                {
                                    title: "FRAMEWORKS AND LIBRARIES",
                                    desc: "React Next.js."
                                },
                                {
                                    title: "GAME ENGINE",
                                    desc: "Three.js with React Three Fiber, refactored from Matter.js."
                                },
                                {
                                    title: "DATABASE AND AUTH",
                                    desc: "Prisma Postgres-Neon, with a DIY auth system using JWTs, jose and bcrypt."
                                }
                            ].map((item, i) => (
                                <div key={i} className="border border-cyan-500/30 bg-black/40 p-5 rounded-md hover:shadow-[0_0_15px_#00ffff55] transition">
                                    <h3 className="text-cyan-300 mb-2 tracking-widest text-sm">{item.title}</h3>
                                    <p className="text-cyan-200/70 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}

                        </div>
                    </section>

                </div>
            </main>

        </div>
    );
}