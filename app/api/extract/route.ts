import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Determine media type
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, or WebP.' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
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

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const extracted = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data: extracted });
  } catch (err) {
    console.error('Extraction error:', err);
    return NextResponse.json({ error: 'Failed to extract receipt data' }, { status: 500 });
  }
}
