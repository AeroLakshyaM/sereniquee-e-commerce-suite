import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runBulkProductAction } from './adminProducts';

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));

describe('runBulkProductAction', () => {
  const query = {
    delete: vi.fn(),
    update: vi.fn(),
    in: vi.fn(),
  };

  beforeEach(() => {
    query.delete.mockReturnValue(query);
    query.update.mockReturnValue(query);
    query.in.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue(query);
  });

  it('updates featured state only for the selected product IDs', async () => {
    await runBulkProductAction('featured', ['p1', 'p2']);

    expect(query.update).toHaveBeenCalledWith({ featured: true });
    expect(query.in).toHaveBeenCalledWith('id', ['p1', 'p2']);
  });

  it('deletes only the selected product IDs', async () => {
    await runBulkProductAction('delete', ['p3']);

    expect(query.delete).toHaveBeenCalledOnce();
    expect(query.in).toHaveBeenCalledWith('id', ['p3']);
  });

  it('does not issue a database mutation for an empty selection', async () => {
    await runBulkProductAction('delete', []);

    expect(mocks.from).not.toHaveBeenCalled();
  });
});
