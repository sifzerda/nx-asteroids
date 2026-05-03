// app/login.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const router = useRouter();
    const { login } = useAuth();

    const [typedTitle, setTypedTitle] = useState("");

    const fullTitle = "SYSTEM LOGIN";

    useEffect(() => {
        let i = 0;

        const interval = setInterval(() => {
            setTypedTitle(fullTitle.slice(0, i + 1));
            i++;

            if (i >= fullTitle.length) {
                clearInterval(interval);
            }
        }, 120); // speed per letter

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // <-- Add this to ensure JSON is parsed properly on server
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            login(data.token); // update context
            router.push('/'); // redirect
        } else {
            setMessage(data.error || 'Login failed');
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center bg-black font-mono text-green-400 relative overflow-hidden animate-[flicker_7s_ease-in-out_infinite]">
            <main className="relative w-full max-w-md p-8 border border-green-500/40 bg-black shadow-[0_0_20px_rgba(0,255,0,0.15)] overflow-hidden">

                {/* scanline overlay */}
                <div className="scanlines" />

                {/* terminal header */}
                <div className="mb-6 text-center">
                    <h1 className="text-xl tracking-[0.3em] uppercase text-green-300 drop-shadow-[0_0_6px_rgba(0,255,0,0.6)]">
                        {typedTitle}
                        <span className="cursor-blink">▍</span>
                    </h1>

                    <p className="text-[10px] tracking-[0.3em] text-green-600 mt-2">
                        AUTHORIZATION REQUIRED
                    </p>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">

                    <input
                        type="email"
                        placeholder="EMAIL>"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black border border-green-700 px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
                    />

                    <input
                        type="password"
                        placeholder="PASSWORD>"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-green-700 px-3 py-2 text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400"
                    />

                    <button className="w-full mt-2 border border-green-500 text-green-300 py-2 uppercase tracking-widest hover:bg-green-900/20 transition">
                        ENTER &gt;
                    </button>

                    {message && (
                        <p className="text-xs text-red-500 mt-2">
                            {message}
                        </p>
                    )}
                </form>

                {/* footer terminal noise */}
                <div className="mt-6 text-xs tracking-[0.3em] text-green-700">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-white hover:underline">
                        Sign up
                    </a>
                </div>
            </main>
        </div>
    );
}