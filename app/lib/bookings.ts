import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    Timestamp,
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
    createdAt: Date | null;
};

type BookingFirestore = {
    roomId: string;
    userId: string;
    description: string;
    start: Timestamp;
    end: Timestamp;
    createdAt?: Timestamp | null;
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
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
    };
};

export const getBookingsByRoom = async (roomId: string): Promise<Booking[]> => {
    const snapshot = await getDocs(bookingsCollection);

    return snapshot.docs
        .map(mapBookingFromSnap)
        .filter((booking) => booking.roomId === roomId);
};

type CreateBookingParams = {
    roomId: string;
    userId: string;
    description: string;
    start: Date;
    end: Date;
};

const hasTimeConflict = (
    start: Date,
    end: Date,
    existing: Booking[]
): boolean => {
    const newStart = start.getTime();
    const newEnd = end.getTime();

    return existing.some((b) => {
        const bStart = b.start.getTime();
        const bEnd = b.end.getTime();

        return !(newEnd <= bStart || newStart >= bEnd);
    });
};

export const createBookingWithConflictCheck = async (
    params: CreateBookingParams
): Promise<string> => {
    const { roomId, userId, description, start, end } = params;

    if (end <= start) {
        throw new Error('End time must be after start time');
    }

    const existing = await getBookingsByRoom(roomId);

    if (hasTimeConflict(start, end, existing)) {
        throw new Error('This time slot is already booked');
    }

    const docRef = await addDoc(bookingsCollection, {
        roomId,
        userId,
        description,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        createdAt: Timestamp.fromDate(new Date()),
    });

    return docRef.id;
};

export const deleteBooking = async (id: string): Promise<void> => {
    const ref = doc(db, 'bookings', id);
    await deleteDoc(ref);
};
