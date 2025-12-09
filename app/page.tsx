'use client';

import { useAuthStore } from './store/auth';
import { logoutUser } from './lib/auth';
import Link from 'next/link';

export default function Home() {
    const user = useAuthStore((s) => s.user);

    if (!user)
        return (
            <div className="text-center space-y-4">
                <h1 className="text-xl">You are not logged in</h1>
                <Link href="/login" className="text-blue-600 underline">
                    Go to login
                </Link>
            </div>
        );

    return (
        <div className="space-y-4">
            <h1 className="text-xl">Hello, {user.displayName}</h1>

            <button
                onClick={logoutUser}
                className="bg-red-500 text-white p-2 rounded"
            >
                Logout
            </button>

            <div>
                <Link href="/rooms" className="text-blue-600 underline">
                    Go to Rooms →
                </Link>
            </div>
        </div>
    );
}
