'use server';

import { grantAdminAccess } from '@/lib/admin-access';

export async function verifyAdminAccessKey(input: string): Promise<{ error?: string }> {
  if (typeof input !== 'string') return { error: 'Invalid access key.' };
  return grantAdminAccess(input);
}
