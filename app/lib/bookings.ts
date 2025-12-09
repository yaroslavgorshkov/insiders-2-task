import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase/firestore';

import { db } from './firebase';

export type Booking = {
    id: string;
    roomId: string;
    userId: string;
    description: string;
    start: Date;
    end: Date;
};

type BookingFirestore = {
    roomId: string;
    userId: string;
    description: string;
    start: Timestamp;
    end: Timestamp;
};

const bookingsCollection = collection(db, 'bookings');

const mapBookingFromSnap = (
    snap: QueryDocumentSnapshot<DocumentData>
): Booking => {
    const data = snap.data() as BookingFirestore;

    return {
        id: snap.id,
        roomId: data.roomId,
        userId: data.userId,
        description: data.description,
        start: data.start.toDate(),
        end: data.end.toDate(),
    };
};

export const getBookingsByRoom = async (roomId: string): Promise<Booking[]> => {
    const q = query(bookingsCollection, where('roomId', '==', roomId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(mapBookingFromSnap);
};

type BookingInput = {
    roomId: string;
    userId: string;
    description: string;
    start: Date;
    end: Date;
};

const hasTimeConflict = (
    bookings: Booking[],
    start: Date,
    end: Date
): boolean => {
    return bookings.some((b) => {
        const overlaps = start < b.end && end > b.start;
        return overlaps;
    });
};

export const createBookingWithConflictCheck = async (
    input: BookingInput
): Promise<string> => {
    const { roomId, userId, description, start, end } = input;

    if (end <= start) {
        throw new Error('End time must be after start time');
    }

    const existing = await getBookingsByRoom(roomId);

    if (hasTimeConflict(existing, start, end)) {
        throw new Error('Time slot already booked');
    }

    const docRef = await addDoc(bookingsCollection, {
        roomId,
        userId,
        description,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
    });

    return docRef.id;
};

export const updateBookingWithConflictCheck = async (
    bookingId: string,
    input: BookingInput
): Promise<void> => {
    const { roomId, userId, description, start, end } = input;

    if (end <= start) {
        throw new Error('End time must be after start time');
    }

    const existing = await getBookingsByRoom(roomId);
    const others = existing.filter((b) => b.id !== bookingId);

    if (hasTimeConflict(others, start, end)) {
        throw new Error('Time slot already booked');
    }

    const ref = doc(db, 'bookings', bookingId);

    await updateDoc(ref, {
        roomId,
        userId,
        description,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
    });
};

export const deleteBooking = async (id: string): Promise<void> => {
    const ref = doc(db, 'bookings', id);
    await deleteDoc(ref);
};
