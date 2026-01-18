'use server';

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

// Helper to get user from session
async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('koojai_token')?.value;
  
  if (!token) return null;
  
  const result = await sql`
    SELECT s.*, st.student_id, st.first_name, st.last_name, st.nickname
    FROM sessions s
    JOIN students st ON s.user_id = st.id AND s.user_type = 'student'
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  
  return result[0] || null;
}

// GET - List all characters for current student
export async function GET() {
  try {
    const session = await getUserFromSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const characters = await sql`
      SELECT * FROM characters 
      WHERE student_id = ${session.student_id}
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new character
export async function POST(request: NextRequest) {
  try {
    const session = await getUserFromSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, avatar, personality, description, voiceGender, voiceName, systemPrompt } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO characters (student_id, name, avatar, personality, description, voice_gender, voice_name, system_prompt)
      VALUES (${session.student_id}, ${name}, ${avatar || '🐰'}, ${personality || ''}, ${description || ''}, ${voiceGender || 'female'}, ${voiceName || 'Kore'}, ${systemPrompt || ''})
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, character: result[0] });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
