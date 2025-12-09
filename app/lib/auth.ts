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
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = userCredential.user;

    await updateProfile(user, {
        displayName: name,
    });

    return user;
};

export const loginUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return userCredential.user;
};

export const logoutUser = async () => {
    await signOut(auth);
};
