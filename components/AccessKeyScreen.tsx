'use client';

import { useState } from 'react';
import { verifyAdminAccessKey } from '@/lib/actions/admin-access';

type Props = {
  onSuccess: () => void;
};

export default function AccessKeyScreen({ onSuccess }: Props) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await verifyAdminAccessKey(key);
    if (result.error) {
      setError(result.error);
      setKey('');
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="card p-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Access Required</h1>
            <p style={{ color: 'var(--muted)' }}>Enter your access key to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-key" className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-soft)' }}>
                Access Key
              </label>
              <input
                id="access-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter 8-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{8}"
                maxLength={8}
                className="w-full px-4 py-3"
                style={{ borderRadius: '12px', border: '1.5px solid #94A3B8', background: '#fff', color: 'var(--ink)' }}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <p className="text-sm" style={{ color: '#B91C1C' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || key.length !== 8}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
