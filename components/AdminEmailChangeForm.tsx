'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { changeAdminEmail } from '@/lib/actions/security';

type Props = {
  adminPath: string;
};

export default function AdminEmailChangeForm({ adminPath }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await changeAdminEmail(new FormData(event.currentTarget));
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    await signOut({ redirect: false });
    router.push(`/${adminPath}/login?message=email_changed`);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold border-b pb-3 mb-4">Change Admin Email</h2>
      <p className="text-sm text-gray-600 mb-4">
        Your email address is your admin username. You will need to sign in again after changing it.
      </p>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-new-email" className="block text-sm font-medium mb-1">
            New email
          </label>
          <input
            id="admin-new-email"
            type="email"
            name="new_email"
            required
            maxLength={254}
            autoComplete="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter your new admin email"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="admin-current-password" className="block text-sm font-medium mb-1">
            Confirm with current password
          </label>
          <input
            id="admin-current-password"
            type="password"
            name="current_password"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Updating…' : 'Update Admin Email'}
        </button>
      </form>
    </div>
  );
}
