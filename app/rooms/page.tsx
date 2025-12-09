'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'next/navigation';
import { createRoom, getRooms, Room, deleteRoom } from '../lib/rooms';
import Link from 'next/link';

type RoomFormData = {
    name: string;
    description: string;
};

export default function RoomsPage() {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset } = useForm<RoomFormData>();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (e) {
                console.error(e);
                setError('Failed to load rooms');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user, router]);

    const onSubmit = async (data: RoomFormData) => {
        if (!user) return;

        setError(null);

        try {
            setLoading(true);
            await createRoom(data.name, data.description, user.uid);
            const updated = await getRooms();
            setRooms(updated);
            reset();
        } catch (e) {
            console.error(e);
            setError('Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deleteRoom(id);
            setRooms((prev) => prev.filter((room) => room.id !== id));
        } catch (e) {
            console.error(e);
            setError('Failed to delete room');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="p-8">Redirecting to login...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Meeting rooms</h1>

            <form
                className="space-y-3 border p-4 rounded"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="space-y-2">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Room name"
                        {...register('name', { required: true })}
                    />
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder="Description"
                        rows={3}
                        {...register('description')}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Create room'}
                </button>

                {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            <div className="space-y-3">
                <h2 className="text-xl font-semibold">Rooms list</h2>

                {rooms.length === 0 && (
                    <p className="text-sm text-gray-400">
                        No rooms yet. Create the first one above.
                    </p>
                )}

                <ul className="space-y-2">
                    {rooms.map((room) => (
                        <li
                            key={room.id}
                            className="border rounded p-3 flex items-start justify-between gap-4"
                        >
                            <div>
                                <div className="font-semibold">{room.name}</div>
                                <div className="text-sm text-gray-300">
                                    {room.description}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <Link
                                    href={`/rooms/${room.id}`}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Open
                                </Link>

                                <button
                                    onClick={() => handleDelete(room.id)}
                                    className="text-sm text-red-500 hover:underline"
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
