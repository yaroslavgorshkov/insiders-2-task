'use client';

import { useForm } from 'react-hook-form';
import { registerUser } from '../lib/auth';
import { createUserProfile } from '../lib/users';
import { useRouter } from 'next/navigation';

type FormData = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterPage() {
    const { register, handleSubmit } = useForm<FormData>();
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        const user = await registerUser(data.email, data.password, data.name);

        await createUserProfile({
            id: user.uid,
            email: user.email ?? data.email,
            name: data.name,
        });

        router.push('/rooms');
    };

    return (
        <div className="max-w-sm mx-auto space-y-4 mt-16 border border-gray-700 bg-black/40 p-6 rounded-xl">
            <h1 className="text-2xl font-bold text-center">Register</h1>

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <input
                    className="w-full p-2 border rounded bg-black border-gray-600"
                    placeholder="Name"
                    {...register('name')}
                />
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
                    Register
                </button>
            </form>
        </div>
    );
}
