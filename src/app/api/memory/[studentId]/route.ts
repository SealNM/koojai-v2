import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const result = await sql`
      SELECT memory_for_next_session 
      FROM reports 
      WHERE student_id = ${studentId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (result.length > 0) {
      return NextResponse.json({ memory: result[0].memory_for_next_session });
    }
    
    return NextResponse.json({ memory: null });
  } catch (error) {
    console.error('Error fetching memory:', error);
    return NextResponse.json({ memory: null });
  }
}
