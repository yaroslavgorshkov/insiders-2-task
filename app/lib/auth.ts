import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

export const registerUser = async (
    email: string,
    password: string,
    name: string
) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(result.user, {
        displayName: name,
    });

    return result.user;
};

export const loginUser = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

export const logoutUser = async () => {
    await signOut(auth);
};
