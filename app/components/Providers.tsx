'use client';

import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/auth';

export const Providers = ({ children }: { children: ReactNode }) => {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    return <>{children}</>;
};
