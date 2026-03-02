import { supabase, isSupabaseConfigured } from './supabase';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import logger from '../utils/logger';

const createLocalAdapter = (key, defaultData = []) => ({
  async getAll() {
    return loadFromLocalStorage(key, defaultData);
  },
  async getById(id) {
    const items = loadFromLocalStorage(key, defaultData);
    return items.find((item) => item.id === id) || null;
  },
  async create(item) {
    const items = loadFromLocalStorage(key, defaultData);
    const newItem = { ...item, id: item.id || Date.now() };
    const updated = [...items, newItem];
    saveToLocalStorage(key, updated);
    return newItem;
  },
  async update(id, changes) {
    const items = loadFromLocalStorage(key, defaultData);
    const updated = items.map((item) => (item.id === id ? { ...item, ...changes } : item));
    saveToLocalStorage(key, updated);
    return updated.find((item) => item.id === id);
  },
  async remove(id) {
    const items = loadFromLocalStorage(key, defaultData);
    saveToLocalStorage(
      key,
      items.filter((item) => item.id !== id)
    );
    return true;
  },
  async query(filterFn) {
    const items = loadFromLocalStorage(key, defaultData);
    return items.filter(filterFn);
  },
});

const createSupabaseAdapter = (table) => ({
  async getAll() {
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true });
    if (error) {
      logger.error(`Failed to fetch ${table}:`, error);
      return [];
    }
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) {
      logger.error(`Failed to fetch ${table} by id:`, error);
      return null;
    }
    return data;
  },
  async create(item) {
    const { id, ...rest } = item;
    const { data, error } = await supabase.from(table).insert(rest).select().single();
    if (error) {
      logger.error(`Failed to create ${table}:`, error);
      throw error;
    }
    return data;
  },
  async update(id, changes) {
    const { data, error } = await supabase.from(table).update(changes).eq('id', id).select().single();
    if (error) {
      logger.error(`Failed to update ${table}:`, error);
      throw error;
    }
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      logger.error(`Failed to delete ${table}:`, error);
      throw error;
    }
    return true;
  },
  async query(filterFn) {
    const all = await this.getAll();
    return all.filter(filterFn);
  },
});

const createAdapter = (table, localKey, defaultData) =>
  isSupabaseConfigured ? createSupabaseAdapter(table) : createLocalAdapter(localKey, defaultData);

const dataService = {
  events: createAdapter('events', 'events'),
  volunteers: createAdapter('volunteers', 'volunteers'),
  attendees: createAdapter('attendees', 'attendees'),
  communications: createAdapter('communications', 'communications'),
  payments: createAdapter('payments', 'payments'),
  donations: createAdapter('donations', 'donations'),
  households: createAdapter('households', 'households'),
  householdMembers: createAdapter('household_members', 'household_members'),
  isConnected: isSupabaseConfigured,
};

export default dataService;
