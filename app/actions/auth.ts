'use server';

import { signOut } from '@/auth';

export async function logoutAction() {
    await signOut({ redirectTo: '/login' });
}

export async function adminLogoutAction() {
    await signOut({ redirectTo: '/admin/login' });
}
