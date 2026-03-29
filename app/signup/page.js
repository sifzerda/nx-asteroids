// app/signup.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authProvider';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      login(data.token); // update context so nav shows "Logout"
      router.push('/profile'); // redirect
    } else {
      setMessage(data.error || 'Signup failed');
    }
  };

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">

            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-24 px-16 bg-white dark:bg-black">

                {/* Card */}
                <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-8 flex flex-col items-center">

                    {/* Top gold line */}
                    <div className="w-full h-[2px] bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 mb-6" />

                    {/* Title */}
                    <h1 className="text-3xl tracking-wide mb-6 text-black dark:text-white flex items-center gap-2">
                        <span className="text-red-500">♦</span>
                        <span className="font-[var(--font-cinzel)]">Sign Up</span>
                        <span className="text-red-500">♥</span>
                    </h1>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
                        />

                        <button
                            type="submit"
                            className="mt-4 w-full py-2 bg-black text-white border border-zinc-700 hover:bg-zinc-900 transition"
                        >
                            Create Account
                        </button>
                        {message && <p className="mt-4 text-red-500">{message}</p>}
                    </form>

                    {/* Suits divider */}
                    <div className="flex items-center gap-3 text-lg my-6">
                        <span className="text-blue-400">♠</span>
                        <span className="text-red-500">♥</span>
                        <span className="text-blue-400">♣</span>
                        <span className="text-red-500">♦</span>
                    </div>

                    {/* Bottom text */}
                    <p className="text-sm text-zinc-500">
                        Already have an account?{" "}
                        <a href="/login" className="text-white hover:underline">
                            Sign in
                        </a>
                    </p>

                    {/* Bottom blue line */}
                    <div className="w-full h-[2px] bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 mt-6" />

                </div>

            </main>
        </div>
    );
}