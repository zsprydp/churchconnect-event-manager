import { saveToLocalStorage, loadFromLocalStorage } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('saveToLocalStorage', () => {
  test('saves data as JSON string', () => {
    saveToLocalStorage('test-key', [1, 2, 3]);
    expect(localStorage.getItem('test-key')).toBe('[1,2,3]');
  });

  test('saves objects', () => {
    saveToLocalStorage('obj', { name: 'Test' });
    expect(JSON.parse(localStorage.getItem('obj'))).toEqual({ name: 'Test' });
  });

  test('handles storage errors gracefully', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    saveToLocalStorage('key', 'value');
    expect(spy).toHaveBeenCalled();

    mockSetItem.mockRestore();
    spy.mockRestore();
  });
});

describe('loadFromLocalStorage', () => {
  test('loads stored data', () => {
    localStorage.setItem('key', JSON.stringify({ a: 1 }));
    const result = loadFromLocalStorage('key');
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
});
