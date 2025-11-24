import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Add course_id column to announcements if it doesn't exist
    const alterTableQuery = `
      ALTER TABLE announcements
      ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    `;

    await client.query(alterTableQuery);

    // Create index on course_id
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);
    `;

    await client.query(createIndexQuery);

    await client.end();

    return NextResponse.json(
      { message: '✅ Migration completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
