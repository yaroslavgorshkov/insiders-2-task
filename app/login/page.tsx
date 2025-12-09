'use client';

import { useForm } from 'react-hook-form';
import { loginUser } from '../lib/auth';
import { useRouter } from 'next/navigation';

type FormData = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const { register, handleSubmit } = useForm<FormData>();
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        await loginUser(data.email, data.password);
        router.push('/rooms');
    };

    return (
        <div className="max-w-sm mx-auto space-y-4 mt-16 border border-gray-700 bg-black/40 p-6 rounded-xl">
            <h1 className="text-2xl font-bold text-center">Login</h1>

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <input
                    className="w-full p-2 border rounded bg-black border-gray-600"
                    placeholder="Email"
                    {...register('email')}
                />
                <input
                    className="w-full p-2 border rounded bg-black border-gray-600"
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                />
                <button className="bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded w-full cursor-pointer">
                    Login
                </button>
            </form>
        </div>
    );
}
