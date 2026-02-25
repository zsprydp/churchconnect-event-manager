import { saveToLocalStorage, loadFromLocalStorage, getStorageUsage, formatBytes, exportAllData, importAllData, clearAllData } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('saveToLocalStorage', () => {
  test('saves data and returns true', () => {
    const result = saveToLocalStorage('test-key', [1, 2, 3]);
    expect(result).toBe(true);
    expect(localStorage.getItem('test-key')).toBe('[1,2,3]');
  });

  test('saves objects', () => {
    saveToLocalStorage('obj', { name: 'Test' });
    expect(JSON.parse(localStorage.getItem('obj'))).toEqual({ name: 'Test' });
  });

  test('returns false on storage errors', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    const result = saveToLocalStorage('key', 'value');
    expect(result).toBe(false);

    mockSetItem.mockRestore();
    spy.mockRestore();
  });
});

describe('loadFromLocalStorage', () => {
  test('loads stored array data', () => {
    localStorage.setItem('key', JSON.stringify([1, 2, 3]));
    const result = loadFromLocalStorage('key', []);
    expect(result).toEqual([1, 2, 3]);
  });

  test('loads stored object data', () => {
    localStorage.setItem('key', JSON.stringify({ a: 1 }));
    const result = loadFromLocalStorage('key', {});
    expect(result).toEqual({ a: 1 });
  });

  test('returns default when key does not exist', () => {
    const result = loadFromLocalStorage('missing', []);
    expect(result).toEqual([]);
  });

  test('returns custom default value', () => {
    const result = loadFromLocalStorage('missing', 'fallback');
    expect(result).toBe('fallback');
  });

  test('returns default on invalid JSON', () => {
    localStorage.setItem('bad', '{invalid json');
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const result = loadFromLocalStorage('bad', []);
    expect(result).toEqual([]);

    spy.mockRestore();
  });

  test('validates array type matches default', () => {
    localStorage.setItem('arr', JSON.stringify('not-an-array'));
    const result = loadFromLocalStorage('arr', []);
    expect(result).toEqual([]);
  });

  test('validates object type matches default', () => {
    localStorage.setItem('obj', JSON.stringify([1, 2]));
    const result = loadFromLocalStorage('obj', {});
    expect(result).toEqual({});
  });
});

describe('getStorageUsage', () => {
  test('returns 0 for empty storage', () => {
    expect(getStorageUsage()).toBe(0);
  });

  test('returns non-zero after saving', () => {
    localStorage.setItem('test', 'hello');
    expect(getStorageUsage()).toBeGreaterThan(0);
  });
});

describe('formatBytes', () => {
  test('formats zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  test('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  test('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  test('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });
});

describe('exportAllData / importAllData', () => {
  test('round-trips data correctly', () => {
    localStorage.setItem('events', JSON.stringify([{ id: 1, name: 'Test' }]));
    localStorage.setItem('volunteers', JSON.stringify([{ id: 1, name: 'Vol' }]));

    const exported = exportAllData();
    expect(exported.version).toBe(1);
    expect(exported.data.events).toEqual([{ id: 1, name: 'Test' }]);

    localStorage.clear();
    const result = importAllData(exported);
    expect(result.success).toBe(true);
    expect(result.imported).toContain('events');
    expect(result.imported).toContain('volunteers');

    expect(JSON.parse(localStorage.getItem('events'))).toEqual([{ id: 1, name: 'Test' }]);
  });

  test('importAllData rejects invalid input', () => {
    const result = importAllData(null);
    expect(result.success).toBe(false);
  });

  test('importAllData rejects missing data key', () => {
    const result = importAllData({ version: 1 });
    expect(result.success).toBe(false);
  });
});

describe('clearAllData', () => {
  test('removes all app keys', () => {
    localStorage.setItem('events', '[]');
    localStorage.setItem('volunteers', '[]');
    localStorage.setItem('unrelated', 'keep');

    clearAllData();

    expect(localStorage.getItem('events')).toBeNull();
    expect(localStorage.getItem('volunteers')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
});
