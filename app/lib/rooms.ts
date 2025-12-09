import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    serverTimestamp,
    updateDoc,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export type Room = {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: Date | null;
};

type RoomFirestore = {
    name: string;
    description: string;
    createdBy: string;
    createdAt?: Timestamp | null;
};

const roomsCollection = collection(db, 'rooms');

const mapRoomFromSnap = (
    docSnap: QueryDocumentSnapshot<DocumentData>
): Room => {
    const data = docSnap.data() as RoomFirestore;

    return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
    };
};

export const createRoom = async (
    name: string,
    description: string,
    userId: string
): Promise<string> => {
    const docRef = await addDoc(roomsCollection, {
        name,
        description,
        createdBy: userId,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
};

export const getRooms = async (): Promise<Room[]> => {
    const snapshot = await getDocs(roomsCollection);
    return snapshot.docs.map(mapRoomFromSnap);
};

export const getRoomById = async (id: string): Promise<Room | null> => {
    const ref = doc(db, 'rooms', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data() as RoomFirestore;

    return {
        id: snap.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
    };
};

export const updateRoom = async (
    id: string,
    payload: Partial<Pick<Room, 'name' | 'description'>>
): Promise<void> => {
    const ref = doc(db, 'rooms', id);
    await updateDoc(ref, payload);
};

export const deleteRoom = async (id: string): Promise<void> => {
    const ref = doc(db, 'rooms', id);
    await deleteDoc(ref);
};

export type RoomRole = 'admin' | 'user';

export type RoomMember = {
    id: string;
    roomId: string;
    userId: string;
    email: string;
    role: RoomRole;
};

type RoomMemberFirestore = {
    userId: string;
    email: string;
    role: RoomRole;
};

const getMembersCollection = (roomId: string) =>
    collection(db, 'rooms', roomId, 'members');

const mapRoomMemberFromSnap =
    (roomId: string) =>
    (snap: QueryDocumentSnapshot<DocumentData>): RoomMember => {
        const data = snap.data() as RoomMemberFirestore;

        return {
            id: snap.id,
            roomId,
            userId: data.userId,
            email: data.email,
            role: data.role,
        };
    };

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
    const col = getMembersCollection(roomId);
    const snapshot = await getDocs(col);

    return snapshot.docs.map(mapRoomMemberFromSnap(roomId));
};

export const addRoomMember = async (params: {
    roomId: string;
    userId: string;
    email: string;
    role: RoomRole;
}): Promise<string> => {
    const { roomId, userId, email, role } = params;

    const col = getMembersCollection(roomId);

    const existingSnap = await getDocs(col);
    const existing = existingSnap.docs
        .map(mapRoomMemberFromSnap(roomId))
        .find((m) => m.userId === userId);

    if (existing) {
        throw new Error('User is already a member of this room');
    }

    const docRef = await addDoc(col, {
        userId,
        email,
        role,
    });

    return docRef.id;
};

export const removeRoomMember = async (
    roomId: string,
    memberId: string
): Promise<void> => {
    const ref = doc(db, 'rooms', roomId, 'members', memberId);
    await deleteDoc(ref);
};
