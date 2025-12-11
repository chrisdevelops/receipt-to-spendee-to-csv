# Receipt to Spendee CSV

A proof of concept app that extracts receipt information from photos using AI vision and exports to CSV format compatible with Spendee budget app.

## Features

- 📸 Take photos or upload receipt images
- 🤖 AI-powered text extraction using OpenAI Vision API
- 📊 Review and edit extracted receipt details
- 💼 Separate batches for Business and Personal receipts
- 📥 Export to CSV format compatible with Spendee
- 💰 Automatic tax extraction and categorization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select **Business** or **Personal** receipt type
2. Click **Take Photo** (mobile) or **Upload Image** to select a receipt image
3. Wait for AI processing (extracts date, amount, tax, category, and note)
4. Review and edit the extracted information in the dialog
5. Click **Add to Batch** to save the receipt
6. Repeat for additional receipts
7. Click **Export CSV** to download the file for import into Spendee

## CSV Format

The exported CSV follows Spendee's import format:
- Date (YYYY-MM-DD)
- Category name
- Amount
- Type (expense)
- Note
- Tax

## Tech Stack

- Next.js 16
- React 19
- Shadcn UI
- Tailwind CSS
- OpenAI Vision API (gpt-4o-mini)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
