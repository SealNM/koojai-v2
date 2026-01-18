import { NextResponse } from 'next/server';
import { saveMood } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, mood } = body;

    if (!student_id || !mood) {
      return NextResponse.json(
        { success: false, message: 'กรุณาส่งข้อมูลให้ครบ' },
        { status: 400 }
      );
    }

    await saveMood({
      student_id,
      mood,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save mood error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
