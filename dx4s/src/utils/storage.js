import store from 'store2';

const STORAGE_SYMBOL = '__local_store__';
const SETTING_SYMBOL = '__setting_store__';

function settingStorage(prefix) {
  const storage = store.get(prefix) || {};
  return {
    get(key) {
      return key ? storage[key] : undefined;
    },
    set(key, value) {
      storage[key] = value;
      store.set(prefix, storage);
    },
  };
}


export function createStorage(prefix) {
  return settingStorage(prefix);
}

export const storage = createStorage(STORAGE_SYMBOL);
export const setting = createStorage(SETTING_SYMBOL);
export const createIsolateStorage = id => createStorage(`${STORAGE_SYMBOL}${id}`);
export default storage;
