/**
 * Unit tests for Database Adapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockDatabaseAdapter,
  type QueryResult,
  type ListResult,
} from '../adapter';

describe('MockDatabaseAdapter', () => {
  let adapter: MockDatabaseAdapter;

  beforeEach(() => {
    adapter = new MockDatabaseAdapter();
  });

  describe('getById', () => {
    it('should return record by ID', async () => {
      adapter.seed('users', [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
      ]);

      const result = await adapter.getById<{ id: string; name: string }>(
        'users',
        '1'
      );

      expect(result.data).toEqual({ id: '1', name: 'Alice', email: 'alice@example.com' });
      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
    });

    it('should return null for non-existent ID', async () => {
      const result = await adapter.getById('users', 'nonexistent');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
      expect(result.status).toBe(404);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      adapter.seed('jobs', [
        { id: '1', title: 'Engineer', company: 'Acme' },
        { id: '2', title: 'Designer', company: 'Acme' },
        { id: '3', title: 'Manager', company: 'Beta' },
      ]);
    });

    it('should return all records without filters', async () => {
      const result = await adapter.list<{ title: string }>('jobs');

      expect(result.data).toHaveLength(3);
      expect(result.error).toBeNull();
      expect(result.count).toBe(3);
    });

    it('should filter by field', async () => {
      const result = await adapter.list('jobs', {
        filters: { company: 'Acme' },
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(j => j.company === 'Acme')).toBe(true);
    });

    it('should paginate results', async () => {
      const result = await adapter.list('jobs', {
        pagination: { page: 1, pageSize: 2 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('should return empty array for no matches', async () => {
      const result = await adapter.list('jobs', {
        filters: { company: 'NonExistent' },
      });

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert new record with provided ID', async () => {
      const result = await adapter.insert('users', {
        id: '1',
        name: 'Bob',
        email: 'bob@example.com',
      });

      expect(result.data).toEqual({
        id: '1',
        name: 'Bob',
        email: 'bob@example.com',
      });
      expect(result.error).toBeNull();
      expect(result.status).toBe(201);
    });

    it('should generate ID if not provided', async () => {
      const result = await adapter.insert('users', {
        name: 'Carol',
      });

      expect(result.data?.id).toBeDefined();
      expect(result.data?.name).toBe('Carol');
    });

    it('should make inserted record retrievable', async () => {
      await adapter.insert('users', { id: 'test-id', name: 'Test' });
      
      const retrieved = await adapter.getById('users', 'test-id');
      
      expect(retrieved.data?.name).toBe('Test');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      adapter.seed('users', [
        { id: '1', name: 'Original', email: 'original@example.com' },
      ]);
    });

    it('should update existing record', async () => {
      const result = await adapter.update('users', '1', {
        name: 'Updated',
      });

      expect(result.data?.name).toBe('Updated');
      expect(result.data?.email).toBe('original@example.com');
      expect(result.status).toBe(200);
    });

    it('should return 404 for non-existent record', async () => {
      const result = await adapter.update('users', 'nonexistent', {
        name: 'Updated',
      });

      expect(result.data).toBeNull();
      expect(result.status).toBe(404);
    });

    it('should preserve ID in updated record', async () => {
      const result = await adapter.update('users', '1', { name: 'New' });
      
      expect(result.data?.id).toBe('1');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      adapter.seed('users', [
        { id: '1', name: 'ToDelete' },
        { id: '2', name: 'ToKeep' },
      ]);
    });

    it('should delete existing record', async () => {
      const result = await adapter.delete('users', '1');

      expect(result.data?.name).toBe('ToDelete');
      expect(result.status).toBe(200);
    });

    it('should remove record from store', async () => {
      await adapter.delete('users', '1');
      
      const retrieved = await adapter.getById('users', '1');
      
      expect(retrieved.data).toBeNull();
      expect(retrieved.status).toBe(404);
    });

    it('should return 404 for non-existent record', async () => {
      const result = await adapter.delete('users', 'nonexistent');

      expect(result.data).toBeNull();
      expect(result.status).toBe(404);
    });

    it('should leave other records intact', async () => {
      await adapter.delete('users', '1');
      
      const remaining = await adapter.getById('users', '2');
      
      expect(remaining.data?.name).toBe('ToKeep');
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy mock adapter', async () => {
      const result = await adapter.healthCheck();
      expect(result).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all seeded data', async () => {
      adapter.seed('users', [{ id: '1', name: 'Test' }]);
      adapter.clear();

      const result = await adapter.getById('users', '1');
      
      expect(result.status).toBe(404);
    });
  });

  describe('transaction', () => {
    it('should execute function and return result', async () => {
      const result = await adapter.transaction(async () => {
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should propagate errors from transaction function', async () => {
      await expect(
        adapter.transaction(async () => {
          throw new Error('Transaction failed');
        })
      ).rejects.toThrow('Transaction failed');
    });
  });
});

describe('QueryResult and ListResult types', () => {
  it('QueryResult should have correct structure', () => {
    const result: QueryResult<{ id: string }> = {
      data: { id: '1' },
      error: null,
      status: 200,
    };

    expect(result.data?.id).toBe('1');
    expect(result.error).toBeNull();
  });

  it('ListResult should have correct structure', () => {
    const result: ListResult<{ id: string }> = {
      data: [{ id: '1' }, { id: '2' }],
      error: null,
      count: 2,
      status: 200,
    };

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(2);
  });
});
