'use server';

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

// Helper to get user from session
async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) return null;
  
  const result = await sql`
    SELECT s.*, st.student_id, st.first_name, st.last_name, st.nickname
    FROM sessions s
    JOIN students st ON s.user_id = st.id AND s.user_type = 'student'
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;
  
  return result[0] || null;
}

// GET - Get single character
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    const result = await sql`
      SELECT * FROM characters 
      WHERE id = ${id}::uuid AND student_id = ${session.student_id}
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    return NextResponse.json({ character: result[0] });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update character
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { name, avatar, personality, description, voiceGender, voiceName, systemPrompt } = body;
    
    const result = await sql`
      UPDATE characters 
      SET 
        name = COALESCE(${name}, name),
        avatar = COALESCE(${avatar}, avatar),
        personality = COALESCE(${personality}, personality),
        description = COALESCE(${description}, description),
        voice_gender = COALESCE(${voiceGender}, voice_gender),
        voice_name = COALESCE(${voiceName}, voice_name),
        system_prompt = COALESCE(${systemPrompt}, system_prompt),
        updated_at = NOW()
      WHERE id = ${id}::uuid AND student_id = ${session.student_id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, character: result[0] });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete character
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    const result = await sql`
      DELETE FROM characters 
      WHERE id = ${id}::uuid AND student_id = ${session.student_id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
