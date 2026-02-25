const STORAGE_KEYS = ['events', 'volunteers', 'attendees', 'communications', 'payments', 'donations'];

const MAX_STORAGE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB safe limit (browsers typically allow 5-10 MB)

export const getStorageUsage = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
  }
  return total;
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const saveToLocalStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    const entrySize = (key.length + serialized.length) * 2;
    const currentUsage = getStorageUsage();

    const existingValue = localStorage.getItem(key);
    const existingSize = existingValue ? (key.length + existingValue.length) * 2 : 0;
    const projectedUsage = currentUsage - existingSize + entrySize;

    if (projectedUsage > MAX_STORAGE_BYTES) {
      console.warn(`localStorage near quota (${formatBytes(projectedUsage)} / ${formatBytes(MAX_STORAGE_BYTES)}). Save for "${key}" skipped.`);
      return false;
    }

    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);

    if (defaultValue !== null && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : defaultValue;
    }
    if (Array.isArray(defaultValue)) {
      return Array.isArray(parsed) ? parsed : defaultValue;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const exportAllData = () => {
  const data = {};
  STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
};

export const importAllData = (exportedJson) => {
  if (!exportedJson || typeof exportedJson !== 'object' || !exportedJson.data) {
    return { success: false, error: 'Invalid backup file format' };
  }

  try {
    const { data } = exportedJson;
    const imported = [];

    STORAGE_KEYS.forEach(key => {
      if (data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[key]));
        imported.push(key);
      }
    });

    return { success: true, imported };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const clearAllData = () => {
  STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
};
