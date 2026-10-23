import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
    },
    from: mocks.from,
  },
}));

function AuthProbe() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="state">{auth.loading ? 'loading' : auth.isAdmin ? 'admin' : 'customer'}</output>
      <button onClick={() => void auth.signIn('shopper@example.com', 'secret')}>Sign in</button>
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    const session = { user: { id: 'user-1', email: 'shopper@example.com' } };
    const roleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    };
    mocks.getSession.mockResolvedValue({ data: { session } });
    mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mocks.from.mockReturnValue(roleQuery);
    mocks.signInWithPassword.mockResolvedValue({ error: null });
  });

  it('hydrates the session and waits for the server-confirmed admin role', async () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('admin'));
    expect(mocks.from).toHaveBeenCalledWith('user_roles');
  });

  it('passes credentials to Supabase sign-in', async () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'shopper@example.com',
      password: 'secret',
    }));
  });
});
