/**
 * 🎭 Character API Service
 * Service สำหรับจัดการ characters ผ่าน API (เก็บใน PostgreSQL)
 */

import { Character } from '@/types';

const API_BASE = '/api/characters';

/**
 * ดึงรายการ characters ทั้งหมดของผู้ใช้
 */
export async function fetchCharacters(): Promise<Character[]> {
  try {
    const res = await fetch(API_BASE, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch characters:', res.status);
      return [];
    }
    
    const data = await res.json();
    
    // Map from DB format to app format
    return (data.characters || []).map(mapDbToCharacter);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
}

/**
 * ดึง character ตาม ID
 */
export async function fetchCharacter(id: string): Promise<Character | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.character ? mapDbToCharacter(data.character) : null;
  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
}

/**
 * สร้าง character ใหม่
 */
export async function createCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'studentId'>): Promise<Character | null> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: character.name,
        avatar: character.avatar,
        personality: character.personality,
        description: character.description,
        voiceGender: character.voiceGender,
        voiceName: character.voiceName,
        systemPrompt: character.systemPrompt,
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to create character:', error);
      return null;
    }
    
    const data = await res.json();
    return data.character ? mapDbToCharacter(data.character) : null;
  } catch (error) {
    console.error('Error creating character:', error);
    return null;
  }
}

/**
 * อัพเดท character
 */
export async function updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: updates.name,
        avatar: updates.avatar,
        personality: updates.personality,
        description: updates.description,
        voiceGender: updates.voiceGender,
        voiceName: updates.voiceName,
        systemPrompt: updates.systemPrompt,
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to update character:', error);
      return null;
    }
    
    const data = await res.json();
    return data.character ? mapDbToCharacter(data.character) : null;
  } catch (error) {
    console.error('Error updating character:', error);
    return null;
  }
}

/**
 * ลบ character
 */
export async function deleteCharacter(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    return res.ok;
  } catch (error) {
    console.error('Error deleting character:', error);
    return false;
  }
}

/**
 * Map จาก DB format (snake_case) เป็น App format (camelCase)
 */
function mapDbToCharacter(db: Record<string, unknown>): Character {
  return {
    id: db.id as string,
    studentId: db.student_id as string,
    name: db.name as string,
    avatar: db.avatar as string || '🐰',
    personality: db.personality as string || '',
    description: db.description as string || '',
    voiceGender: (db.voice_gender as 'male' | 'female') || 'female',
    voiceName: db.voice_name as string || 'Kore',
    systemPrompt: db.system_prompt as string || '',
    createdAt: db.created_at ? new Date(db.created_at as string).getTime() : Date.now(),
    updatedAt: db.updated_at ? new Date(db.updated_at as string).getTime() : Date.now(),
  };
}
