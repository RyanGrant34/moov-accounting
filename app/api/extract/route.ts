import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// In-memory rate limiter: max 10 calls per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type SupportedMime = typeof SUPPORTED_TYPES[number];

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  // Check API key is configured
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json({ error: 'AI service is not configured. Add ANTHROPIC_API_KEY in Vercel environment variables.' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File size check — must happen before reading into memory
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB.' },
        { status: 413 }
      );
    }

    // MIME type check
    if (!SUPPORTED_TYPES.includes(file.type as SupportedMime)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use JPG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type as SupportedMime;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64 },
            },
            {
              type: 'text',
              text: `You are a receipt/invoice parser. Extract the key financial data from this receipt image and return ONLY a valid JSON object with no markdown, no explanation, just raw JSON.

Return exactly this structure:
{
  "vendor": "business name",
  "date": "YYYY-MM-DD",
  "amount": "12.34",
  "currency": "USD",
  "category": "one of: saas, travel, marketing, hardware, payroll, hosting, office, food, revenue, other",
  "description": "brief description of what was purchased"
}

Rules:
- vendor: the store/restaurant/service name
- date: use today's date (${new Date().toISOString().split('T')[0]}) if not visible
- amount: total amount as a string with 2 decimal places, no currency symbol
- currency: 3-letter code (USD, CAD, EUR, GBP), default USD
- category: pick the closest match from the list
- description: short natural description like "Lunch at Wendy's" or "Flight to NYC"

If you cannot read the receipt clearly, still return your best guess based on what is visible.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let extracted: Record<string, string>;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI could not parse the receipt. Try a clearer image.' }, { status: 422 });
    }

    // Validate shape before returning to client
    const safe = {
      vendor:      typeof extracted.vendor === 'string'      ? extracted.vendor      : '',
      date:        typeof extracted.date === 'string'        ? extracted.date        : new Date().toISOString().split('T')[0],
      amount:      typeof extracted.amount === 'string'      ? extracted.amount      : '0.00',
      currency:    typeof extracted.currency === 'string'    ? extracted.currency    : 'USD',
      category:    typeof extracted.category === 'string'    ? extracted.category    : '',
      description: typeof extracted.description === 'string' ? extracted.description : '',
    };

    return NextResponse.json({ success: true, data: safe });
  } catch (err) {
    console.error('Extraction error:', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('401') || msg.includes('authentication') || msg.includes('API key')) {
      return NextResponse.json({ error: 'Invalid API key. Check ANTHROPIC_API_KEY in Vercel settings.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to extract receipt data' }, { status: 500 });
  }
}
