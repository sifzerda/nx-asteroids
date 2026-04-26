// app/login.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const router = useRouter();
    const { login } = useAuth();

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
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">

            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-24 px-16 bg-white dark:bg-black">

                {/* Card container */}
                <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-8 flex flex-col items-center">

                    {/* Top gold line */}
                    <div className="w-full h-[2px] bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 mb-6" />

                    {/* Title */}
                    <h1 className="text-3xl tracking-wide mb-6 text-black dark:text-white flex items-center gap-2">
                        <span className="font-[var(--font-cinzel)]">Login</span>
                    </h1>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className="mt-4 w-full py-2 bg-black text-white border border-zinc-700 hover:bg-zinc-900 transition"
                        >
                            Sign In
                        </button>

                        {message && (
                            <p className="mt-4 text-sm text-red-600">{message}</p>
                        )}
                    </form>

                    {/* Divider suits */}
                    <div className="flex items-center gap-3 text-lg my-6">
                        <span>☄️</span>
                        <span>☄️</span>
                        <span>☄️</span>
                        <span>☄️</span>
                    </div>

                    {/* Bottom text */}
                    <p className="text-sm text-zinc-500">
                        No account?{" "}
                        <a href="/signup" className="text-white hover:underline">
                            Register
                        </a>
                    </p>

                    {/* Bottom blue line */}
                    <div className="w-full h-[2px] bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 mt-6" />

                </div>

            </main>
        </div>
    );
}