import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
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

export type RoomRole = 'owner' | 'admin' | 'user';

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

const roomsCollection = collection(db, 'rooms');

const roomMembersCollection = (roomId: string) =>
    collection(db, 'rooms', roomId, 'members');

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
    ownerId: string,
    ownerEmail: string
): Promise<string> => {
    const roomDoc = await addDoc(roomsCollection, {
        name,
        description,
        createdBy: ownerId,
        createdAt: serverTimestamp(),
    });

    await addDoc(roomMembersCollection(roomDoc.id), {
        userId: ownerId,
        email: ownerEmail,
        role: 'owner' as RoomRole,
    });

    return roomDoc.id;
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

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
    const snapshot = await getDocs(roomMembersCollection(roomId));

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as RoomMemberFirestore;

        return {
            id: docSnap.id,
            roomId,
            userId: data.userId,
            email: data.email,
            role: data.role,
        };
    });
};

export const addRoomMember = async (
    member: Omit<RoomMember, 'id'>
): Promise<string> => {
    const ref = await addDoc(roomMembersCollection(member.roomId), {
        userId: member.userId,
        email: member.email,
        role: member.role,
    });

    return ref.id;
};

export const removeRoomMember = async (
    roomId: string,
    memberId: string
): Promise<void> => {
    const ref = doc(db, 'rooms', roomId, 'members', memberId);
    await deleteDoc(ref);
};

export const getRoomsForUser = async (userId: string): Promise<Room[]> => {
    const snapshot = await getDocs(roomsCollection);
    const result: Room[] = [];

    for (const roomSnap of snapshot.docs) {
        const room = mapRoomFromSnap(roomSnap);

        if (room.createdBy === userId) {
            result.push(room);
            continue;
        }

        const membersCol = collection(roomSnap.ref, 'members');
        const membersSnapshot = await getDocs(membersCol);

        const isMember = membersSnapshot.docs.some((memberSnap) => {
            const data = memberSnap.data() as RoomMemberFirestore;
            return data.userId === userId;
        });

        if (isMember) {
            result.push(room);
        }
    }

    return result;
};
