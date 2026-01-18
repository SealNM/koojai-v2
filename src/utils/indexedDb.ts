import { Character, Chat, LocalMessage, LocalSummary } from '@/types';

const DB_NAME = 'KooJaiCharacterChatDB';
const DB_VERSION = 2;

const STORES = {
  CHARACTERS: 'characters',
  CHATS: 'chats',
  MESSAGES: 'messages',
  SUMMARIES: 'summaries',
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: any) => {
      const db = req.result;
      const oldVersion = e.oldVersion;

      if (oldVersion < 2) {
        // Characters store
        if (!db.objectStoreNames.contains(STORES.CHARACTERS)) {
          const store = db.createObjectStore(STORES.CHARACTERS, { keyPath: 'id' });
          store.createIndex('studentId', 'studentId', { unique: false });
        }

        // Chats store
        if (!db.objectStoreNames.contains(STORES.CHATS)) {
          const store = db.createObjectStore(STORES.CHATS, { keyPath: 'id' });
          store.createIndex('studentId', 'studentId', { unique: false });
          store.createIndex('characterId', 'characterId', { unique: false });
        }

        // Messages store
        if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
          const store = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
          store.createIndex('chatId', 'chatId', { unique: false });
        }

        // Summaries store (Local cache)
        if (!db.objectStoreNames.contains(STORES.SUMMARIES)) {
          const store = db.createObjectStore(STORES.SUMMARIES, { keyPath: 'id' });
          store.createIndex('chatId', 'chatId', { unique: true });
          store.createIndex('studentId', 'studentId', { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// === Characters ===
export async function saveCharacter(character: Character): Promise<void> {
  console.log('saveCharacter called:', character);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHARACTERS, 'readwrite');
    tx.objectStore(STORES.CHARACTERS).put(character);
    tx.oncomplete = () => {
      console.log('saveCharacter success:', character.id);
      resolve();
    };
    tx.onerror = () => {
      console.error('saveCharacter error:', tx.error);
      reject(tx.error);
    };
  });
}

export async function getCharacters(studentId: string): Promise<Character[]> {
  console.log('getCharacters called with studentId:', studentId);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHARACTERS, 'readonly');
    const store = tx.objectStore(STORES.CHARACTERS);
    const idx = store.index('studentId');
    const req = idx.getAll(IDBKeyRange.only(studentId));
    req.onsuccess = () => {
      console.log('getCharacters result:', req.result);
      resolve(req.result);
    };
    req.onerror = () => {
      console.error('getCharacters error:', req.error);
      reject(req.error);
    };
  });
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHARACTERS, 'readonly');
    const req = tx.objectStore(STORES.CHARACTERS).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// === Chats ===
export async function createChat(chat: Chat): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHATS, 'readwrite');
    tx.objectStore(STORES.CHATS).add(chat);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChats(characterId: string): Promise<Chat[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHATS, 'readonly');
    const idx = tx.objectStore(STORES.CHATS).index('characterId');
    const req = idx.getAll(IDBKeyRange.only(characterId));
    req.onsuccess = () => {
      const list = req.result as Chat[];
      list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getChatsByStudent(studentId: string): Promise<Chat[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHATS, 'readonly');
    const idx = tx.objectStore(STORES.CHATS).index('studentId');
    const req = idx.getAll(IDBKeyRange.only(studentId));
    req.onsuccess = () => {
      const list = req.result as Chat[];
      list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateChat(chat: Chat): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHATS, 'readwrite');
    tx.objectStore(STORES.CHATS).put(chat);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// === Messages ===
export async function saveLocalMessage(msg: LocalMessage): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.MESSAGES, STORES.CHATS], 'readwrite');
    tx.objectStore(STORES.MESSAGES).add(msg);
    
    // Update lastMessageAt in Chat
    const chatStore = tx.objectStore(STORES.CHATS);
    const chatReq = chatStore.get(msg.chatId);
    chatReq.onsuccess = () => {
      const chat = chatReq.result as Chat;
      if (chat) {
        chat.lastMessageAt = msg.timestamp;
        chatStore.put(chat);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChatMessages(chatId: string): Promise<LocalMessage[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGES, 'readonly');
    const idx = tx.objectStore(STORES.MESSAGES).index('chatId');
    const req = idx.getAll(IDBKeyRange.only(chatId));
    req.onsuccess = () => {
      const list = req.result as LocalMessage[];
      list.sort((a, b) => a.timestamp - b.timestamp);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

// === Summaries ===
export async function saveLocalSummary(summary: LocalSummary): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.SUMMARIES, STORES.CHATS], 'readwrite');
    tx.objectStore(STORES.SUMMARIES).put(summary);
    
    // Mark chat as summarized
    const chatStore = tx.objectStore(STORES.CHATS);
    const chatReq = chatStore.get(summary.chatId);
    chatReq.onsuccess = () => {
      const chat = chatReq.result as Chat;
      if (chat) {
        chat.isSummarized = true;
        chatStore.put(chat);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
