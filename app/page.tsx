'use client';

import { useAuthStore } from './store/auth';
import { logoutUser } from './lib/auth';
import Link from 'next/link';

export default function Home() {
    const user = useAuthStore((s) => s.user);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="border border-gray-700 bg-black/40 rounded-xl p-8 text-center space-y-4 max-w-sm w-full">
                    <h1 className="text-xl font-semibold">
                        You are not logged in
                    </h1>

                    <Link
                        href="/login"
                        className="text-blue-500 hover:text-blue-400 underline transition block"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="text-blue-500 hover:text-blue-400 underline transition block"
                    >
                        Register
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-full">
            <div className="border border-gray-700 bg-black/40 rounded-xl p-8 text-center space-y-5 max-w-sm w-full">
                <h1 className="text-xl font-semibold">
                    Hello, {user.displayName}
                </h1>

                <button
                    onClick={logoutUser}
                    className="bg-red-600 hover:bg-red-700 transition text-white py-2 rounded cursor-pointer w-full"
                >
                    Logout
                </button>

                <Link
                    href="/rooms"
                    className="text-blue-500 hover:text-blue-400 underline transition block"
                >
                    Go to Rooms
                </Link>
            </div>
        </div>
    );
}
