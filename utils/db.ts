
import { Product, Agent } from '../types';

const DB_NAME = 'LG_PLATFORM_DB';
const PRODUCT_STORE = 'products';
const AGENT_STORE = 'agents';
const DB_VERSION = 2; // 升级版本以支持新表

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
        db.createObjectStore(PRODUCT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(AGENT_STORE)) {
        db.createObjectStore(AGENT_STORE, { keyPath: 'whatsapp' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveProductsDB = async (products: Product[]) => {
  const db = await initDB();
  const tx = db.transaction(PRODUCT_STORE, 'readwrite');
  const store = tx.objectStore(PRODUCT_STORE);
  store.clear();
  products.forEach(p => store.add(p));
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

export const getProductsDB = async (): Promise<Product[]> => {
  const db = await initDB();
  const tx = db.transaction(PRODUCT_STORE, 'readonly');
  const store = tx.objectStore(PRODUCT_STORE);
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveAgentsDB = async (agents: Agent[]) => {
  const db = await initDB();
  const tx = db.transaction(AGENT_STORE, 'readwrite');
  const store = tx.objectStore(AGENT_STORE);
  store.clear();
  agents.forEach(a => store.add(a));
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

export const getAgentsDB = async (): Promise<Agent[]> => {
  const db = await initDB();
  const tx = db.transaction(AGENT_STORE, 'readonly');
  const store = tx.objectStore(AGENT_STORE);
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};
