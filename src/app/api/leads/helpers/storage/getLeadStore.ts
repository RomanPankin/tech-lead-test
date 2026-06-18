import type { LeadStore } from '../types';
import { FileLeadStore } from './fileLeadStore';

let store: LeadStore | null = null;

/** Lazily construct the configured store (singleton per process). */
export function getLeadStore(): LeadStore {
  if (!store) {
    const path = process.env.LEAD_STORE_PATH ?? './data/leads.jsonl';
    store = new FileLeadStore(path);
  }

  return store;
}
