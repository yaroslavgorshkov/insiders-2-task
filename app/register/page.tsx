'use client';

import { useForm } from 'react-hook-form';
import { registerUser } from '../lib/auth';

type FormData = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterPage() {
    const { register, handleSubmit } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        await registerUser(data.email, data.password, data.name);
    };

    return (
        <div className="max-w-sm mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Register</h1>

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Name"
                    {...register('name')}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Email"
                    {...register('email')}
                />
                <input
                    className="w-full p-2 border rounded"
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                />
                <button className="bg-blue-600 text-white p-2 rounded w-full">
                    Register
                </button>
            </form>
        </div>
    );
}
