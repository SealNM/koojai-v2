import { NextResponse } from 'next/server';
import { getReports, saveReport } from '@/lib/db';

export async function GET() {
  try {
    const reports = await getReports();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { reports: [], error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const report = await request.json();
    await saveReport(report);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save report error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
