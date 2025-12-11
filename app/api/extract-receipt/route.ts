import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check for API key first
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client only when the route is called (not during build)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Use OpenAI Vision API to extract receipt data
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract receipt information from this image and return it as a JSON object with the following structure:
{
  "date": "YYYY-MM-DD format, or empty string if not found",
  "amount": number (total amount including tax, 0 if not found),
  "tax": number (tax amount, 0 if not found or cannot be calculated),
  "category": "string (suggest a category like 'Food & Dining', 'Transportation', 'Health', 'Business', 'Shopping', etc. based on the receipt content, or 'Uncategorized' if unclear)",
  "note": "string (brief description, merchant name, or first line of receipt, max 100 characters)"
}

Important:
- Extract the date in YYYY-MM-DD format. If only partial date info is available, use today's date as fallback.
- The amount should be the total amount paid (including tax).
- Tax should be the tax amount separately if visible, otherwise calculate as: total - subtotal, or 0 if not determinable.
- Category should be inferred from the merchant name or items on the receipt.
- Note should be a brief, useful description (merchant name, location, or key items).
- Return ONLY valid JSON, no other text.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const extractedData = JSON.parse(content);

    // Validate and normalize the response
    const result = {
      date: extractedData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(extractedData.amount) || 0,
      tax: parseFloat(extractedData.tax) || 0,
      category: extractedData.category || 'Uncategorized',
      note: (extractedData.note || '').substring(0, 100),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt image' },
      { status: 500 }
    );
  }
}

