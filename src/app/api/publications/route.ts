import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { fillBilingual } from '@/lib/translate';

// GET - List publications with filtering and search
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const year = searchParams.get('year') || '';
    const tag = searchParams.get('tag') || '';
    const featured = searchParams.get('featured') || '';

    const query: any = { published: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (type) {
      query.type = type;
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (tag) {
      query.tags = tag;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [publications, total] = await Promise.all([
      Publication.find(query)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Publication.countDocuments(query),
    ]);

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new publication (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();

    // Validate required fields
    const required = ['title', 'abstract', 'authors', 'year', 'type', 'journal', 'slug', 'fileUrl', 'fileName'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check for duplicate slug
    const existing = await Publication.findOne({ slug: data.slug });
    if (existing) {
      return NextResponse.json({ error: 'A publication with this slug already exists' }, { status: 409 });
    }

    // Sanitize and validate year
    const year = parseInt(data.year);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Auto-fill missing language for title and abstract
    const [title, abstract] = await Promise.all([
      fillBilingual(data.title ?? {}),
      fillBilingual(data.abstract ?? {}),
    ]);

    const publication = await Publication.create({
      ...data,
      title,
      abstract,
      year,
      downloadCount: 0,
    });

    return NextResponse.json({ publication }, { status: 201 });
  } catch (error) {
    console.error('Error creating publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
