import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
    DocumentData,
    QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
    id: string;
    email: string;
    name: string;
};

const usersCollection = collection(db, 'users');

export const createUserProfile = async (params: {
    id: string;
    email: string;
    name: string;
}): Promise<void> => {
    const ref = doc(usersCollection, params.id);

    await setDoc(ref, {
        email: params.email,
        name: params.name,
    });
};

export const getUserByEmail = async (
    email: string
): Promise<UserProfile | null> => {
    const q = query(usersCollection, where('email', '==', email));
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data() as { email: string; name: string };

    return {
        id: docSnap.id,
        email: data.email,
        name: data.name,
    };
};
