'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import {
    getRoomById,
    updateRoom,
    Room,
    RoomMember,
    RoomRole,
    getRoomMembers,
    addRoomMember,
    removeRoomMember,
} from '../../lib/rooms';
import { useAuthStore } from '../../store/auth';
import {
    Booking,
    createBookingWithConflictCheck,
    deleteBooking,
    getBookingsByRoom,
} from '../../lib/bookings';
import { getUserByEmail } from '../../lib/users';

type RoomFormData = {
    name: string;
    description: string;
};

type BookingFormData = {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
};

type AddMemberFormData = {
    email: string;
    role: RoomRole;
};

const buildDateTime = (date: string, time: string): Date => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    return new Date(year, month - 1, day, hours, minutes);
};

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;

    const user = useAuthStore((s) => s.user);

    const [loadingRoom, setLoadingRoom] = useState(true);
    const [savingRoom, setSavingRoom] = useState(false);
    const [room, setRoom] = useState<Room | null>(null);
    const [roomError, setRoomError] = useState<string | null>(null);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSaving, setBookingSaving] = useState(false);

    const [members, setMembers] = useState<RoomMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [membersSaving, setMembersSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset: resetRoomForm,
    } = useForm<RoomFormData>();

    const {
        register: registerBooking,
        handleSubmit: handleSubmitBooking,
        reset: resetBookingForm,
    } = useForm<BookingFormData>();

    const {
        register: registerMember,
        handleSubmit: handleSubmitMember,
        reset: resetMemberForm,
    } = useForm<AddMemberFormData>();

    const isOwner = user && room && room.createdBy === user.uid;

    const isAdmin = Boolean(
        user &&
        room &&
        (room.createdBy === user.uid ||
            members.some((m) => m.userId === user.uid && m.role === 'admin'))
    );

    const loadBookings = async (currentRoomId: string) => {
        setLoadingBookings(true);
        try {
            const data = await getBookingsByRoom(currentRoomId);
            const sorted = data
                .slice()
                .sort((a, b) => a.start.getTime() - b.start.getTime());
            setBookings(sorted);
        } catch (e) {
            console.error(e);
            setBookingError('Failed to load bookings');
        } finally {
            setLoadingBookings(false);
        }
    };

    const loadMembers = async (currentRoomId: string) => {
        setMembersLoading(true);
        setMembersError(null);
        try {
            const data = await getRoomMembers(currentRoomId);
            setMembers(data);
        } catch (e) {
            console.error(e);
            setMembersError('Failed to load members');
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getRoomById(roomId);

                if (!data) {
                    setRoomError('Room not found');
                    return;
                }

                setRoom(data);

                resetRoomForm({
                    name: data.name,
                    description: data.description,
                });

                await Promise.all([loadBookings(roomId), loadMembers(roomId)]);
            } catch (e) {
                console.error(e);
                setRoomError('Failed to load room');
            } finally {
                setLoadingRoom(false);
            }
        };

        load();
    }, [roomId, resetRoomForm]);

    const onRoomSubmit = async (values: RoomFormData) => {
        if (!room || !isOwner) return;

        setRoomError(null);
        setSavingRoom(true);

        try {
            await updateRoom(room.id, {
                name: values.name,
                description: values.description,
            });

            setRoom((prev) => (prev ? { ...prev, ...values } : prev));
        } catch (e) {
            console.error(e);
            setRoomError('Failed to update room');
        } finally {
            setSavingRoom(false);
        }
    };

    const onBookingSubmit = async (values: BookingFormData) => {
        if (!user || !room || !isAdmin) return;

        setBookingError(null);

        const { date, startTime, endTime, description } = values;

        const start = buildDateTime(date, startTime);
        const end = buildDateTime(date, endTime);

        try {
            setBookingSaving(true);

            await createBookingWithConflictCheck({
                roomId: room.id,
                userId: user.uid,
                description,
                start,
                end,
            });

            await loadBookings(room.id);
            resetBookingForm();
        } catch (e: unknown) {
            console.error(e);

            if (e instanceof Error) {
                setBookingError(e.message);
            } else {
                setBookingError('Failed to create booking');
            }
        } finally {
            setBookingSaving(false);
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!room || !isAdmin) return;

        try {
            setBookingError(null);
            setBookingSaving(true);
            await deleteBooking(bookingId);

            await loadBookings(room.id);
        } catch (e) {
            console.error(e);
            setBookingError('Failed to delete booking');
        } finally {
            setBookingSaving(false);
        }
    };

    const onAddMember = async (values: AddMemberFormData) => {
        if (!room || !isAdmin) return;

        setMembersError(null);
        setMembersSaving(true);

        try {
            const userProfile = await getUserByEmail(values.email.trim());

            if (!userProfile) {
                setMembersError('User with this email was not found');
                return;
            }

            await addRoomMember({
                roomId: room.id,
                userId: userProfile.id,
                email: userProfile.email,
                role: values.role,
            });

            await loadMembers(room.id);
            resetMemberForm();
        } catch (e) {
            console.error(e);
            setMembersError('Failed to add member');
        } finally {
            setMembersSaving(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!room || !isAdmin) return;

        setMembersError(null);
        setMembersSaving(true);

        try {
            await removeRoomMember(room.id, memberId);
            await loadMembers(room.id);
        } catch (e) {
            console.error(e);
            setMembersError('Failed to remove member');
        } finally {
            setMembersSaving(false);
        }
    };

    if (loadingRoom) {
        return <div className="p-8">Loading room...</div>;
    }

    if (!room) {
        return (
            <div className="p-6">
                <p className="text-red-500 mb-4">
                    {roomError ?? 'Room not found'}
                </p>
                <Link href="/rooms" className="text-blue-500 underline">
                    Back to rooms
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Room: {room.name}</h1>
                <Link href="/rooms" className="text-sm text-blue-500 underline">
                    ← Back to rooms
                </Link>
            </div>

            <div className="border rounded p-4 space-y-3">
                <h2 className="text-lg font-semibold">Room details</h2>

                {isOwner ? (
                    <form
                        className="space-y-3"
                        onSubmit={handleSubmit(onRoomSubmit)}
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
                            disabled={savingRoom}
                        >
                            {savingRoom ? 'Saving...' : 'Save changes'}
                        </button>

                        {roomError && (
                            <p className="text-red-500 text-sm">{roomError}</p>
                        )}
                    </form>
                ) : (
                    <div className="space-y-2">
                        <div className="font-semibold">{room.name}</div>
                        <div className="text-sm text-gray-300">
                            {room.description}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            You don&apos;t have permission to edit this room.
                        </p>
                    </div>
                )}
            </div>

            <div className="border rounded p-4 space-y-3">
                <h2 className="text-lg font-semibold">Members</h2>

                {membersLoading ? (
                    <p>Loading members...</p>
                ) : (
                    <>
                        {members.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                No members yet.
                            </p>
                        ) : (
                            <ul className="space-y-1 text-sm">
                                {members.map((m) => (
                                    <li
                                        key={m.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {m.email}
                                            </span>{' '}
                                            <span className="text-xs text-gray-400">
                                                (
                                                {m.role === 'admin'
                                                    ? 'Admin'
                                                    : 'User'}
                                                )
                                            </span>
                                        </div>
                                        {isAdmin &&
                                            user &&
                                            user.uid !== m.userId && (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveMember(m.id)
                                                    }
                                                    className="text-xs text-red-500 hover:underline"
                                                    disabled={membersSaving}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {isAdmin ? (
                            <form
                                className="mt-3 space-y-2"
                                onSubmit={handleSubmitMember(onAddMember)}
                            >
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="email"
                                        className="flex-1 p-2 border rounded"
                                        placeholder="User email"
                                        {...registerMember('email', {
                                            required: true,
                                        })}
                                    />
                                    <select
                                        className="p-2 border rounded md:w-32"
                                        defaultValue="user"
                                        {...registerMember('role', {
                                            required: true,
                                        })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                    disabled={membersSaving}
                                >
                                    {membersSaving ? 'Adding...' : 'Add member'}
                                </button>
                                {membersError && (
                                    <p className="text-red-500 text-sm">
                                        {membersError}
                                    </p>
                                )}
                            </form>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Only room admins can manage members.
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="border rounded p-4 space-y-4">
                <h2 className="text-lg font-semibold">Bookings</h2>

                {user ? (
                    isAdmin ? (
                        <form
                            className="space-y-3"
                            onSubmit={handleSubmitBooking(onBookingSubmit)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input
                                    type="date"
                                    className="p-2 border rounded"
                                    {...registerBooking('date', {
                                        required: true,
                                    })}
                                />
                                <input
                                    type="time"
                                    className="p-2 border rounded"
                                    {...registerBooking('startTime', {
                                        required: true,
                                    })}
                                />
                                <input
                                    type="time"
                                    className="p-2 border rounded"
                                    {...registerBooking('endTime', {
                                        required: true,
                                    })}
                                />
                            </div>
                            <textarea
                                className="w-full p-2 border rounded"
                                placeholder="Booking description"
                                rows={2}
                                {...registerBooking('description')}
                            />

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                disabled={bookingSaving}
                            >
                                {bookingSaving ? 'Saving...' : 'Create booking'}
                            </button>

                            {bookingError && (
                                <p className="text-red-500 text-sm">
                                    {bookingError}
                                </p>
                            )}
                        </form>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Only room admins can create bookings.
                        </p>
                    )
                ) : (
                    <p className="text-sm text-gray-400">
                        Log in to view and create bookings.
                    </p>
                )}

                <div className="space-y-2">
                    {loadingBookings ? (
                        <p>Loading bookings...</p>
                    ) : bookings.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No bookings yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {bookings.map((b) => (
                                <li
                                    key={b.id}
                                    className="border rounded p-3 flex items-start justify-between gap-4"
                                >
                                    <div>
                                        <div className="text-sm font-semibold">
                                            {b.start.toLocaleDateString()}{' '}
                                            {b.start.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {' – '}
                                            {b.end.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {b.description || 'No description'}
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() =>
                                                handleDeleteBooking(b.id)
                                            }
                                            className="text-sm text-red-500 hover:underline"
                                            disabled={bookingSaving}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
