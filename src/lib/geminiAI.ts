import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export interface BlogGenerationInput {
  topic: string;
  additionalNotes?: string;
}

export interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export async function generateBlogContent(
  input: BlogGenerationInput
): Promise<GeneratedBlogContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a professional content writer for Sereniquee, a luxury handmade candle e-commerce business run by a mother. The brand focuses on handcrafted, aromatic candles made with love, natural ingredients, and beautiful fragrances.

Your task is to generate a complete, engaging, and SEO-optimized blog post based on the topic provided by the business owner.

Topic: ${input.topic}
${input.additionalNotes ? `Additional notes from the owner: ${input.additionalNotes}` : ''}

Please generate the following:

1. **Title**: An engaging, SEO-friendly blog post title (50-60 characters)
2. **Content**: A comprehensive, well-structured blog post (800-1200 words) that includes:
   - An engaging introduction that hooks the reader (2-3 paragraphs)
   - Multiple main sections with clear section headings (use format: "SECTION: [Heading Text]" on its own line)
   - Each section should have 2-4 paragraphs explaining the topic
   - Use "BOLD: [text]" format when you want to emphasize important points
   - Practical tips, insights, or storytelling related to the topic
   - Connection to Sereniquee candles, home ambiance, self-care, or wellness where appropriate
   - Natural inclusion of SEO keywords related to candles, home decor, aromatherapy, handmade products
   - A warm, personal tone that reflects a mother's care and passion
   - Short paragraphs (2-4 sentences each) for easy reading
   - A conclusion that encourages engagement or action (2-3 paragraphs)
3. **Excerpt**: A compelling 2-sentence summary (120-160 characters) that teases the content
4. **Tags**: 5-8 relevant SEO-friendly tags (lowercase, single words or short phrases like "candle care", "aromatherapy", "home decor", "self care", "handmade", "luxury candles", etc.)

IMPORTANT FORMATTING RULES:
- DO NOT use markdown symbols like #, ##, *, **, or _
- To create a section heading, write: SECTION: [Your Heading Text] on its own line
- To make text bold/emphasized, write: BOLD: [your important text]
- Separate paragraphs with double line breaks (\n\n)
- Write in a natural, flowing style that's easy to read
- Keep the tone conversational and warm

Format your response as JSON with this exact structure:
{
  "title": "Your Generated Title Here",
  "content": "Full blog post content here with paragraphs separated by double line breaks (\\n\\n). Use SECTION: for headings and BOLD: for emphasis.",
  "excerpt": "Your two-sentence summary here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoTitle": "SEO-optimized title (50-60 chars)",
  "seoDescription": "Meta description for Google (120-160 chars)",
  "seoKeywords": "keyword1, keyword2, keyword3, keyword4, keyword5"
}

Important guidelines:
- Write in a warm, conversational, yet professional tone
- Use storytelling to connect emotionally with readers
- Include practical value (tips, how-tos, insights)
- Mention seasonal themes, home ambiance, wellness, or self-care where relevant
- Make the content shareable and engaging
- Ensure SEO optimization with natural keyword usage
- Keep paragraphs short and scannable
- Use transitions between sections
- End with a call-to-action or thoughtful reflection

Generate the JSON response now:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response (sometimes AI wraps it in code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);

    return {
      title: parsed.title || 'Untitled Blog Post',
      content: parsed.content || '',
      excerpt: parsed.excerpt || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      seoTitle: parsed.seoTitle || parsed.title || '',
      seoDescription: parsed.seoDescription || parsed.excerpt || '',
      seoKeywords: parsed.seoKeywords || '',
    };
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw new Error('Failed to generate blog content. Please try again.');
  }
}

export async function enhanceExistingContent(
  existingContent: string,
  instructions: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a professional content editor for Sereniquee, a luxury handmade candle business.

The business owner has written some content and wants you to enhance it.

Original content:
${existingContent}

Enhancement instructions:
${instructions}

Please improve the content while:
- Maintaining the owner's voice and personal touch
- Making it more engaging and SEO-friendly
- Ensuring proper structure and flow
- Keeping the warm, personal tone
- Adding relevant details where needed

Return ONLY the enhanced content (not wrapped in JSON, just the plain text):`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error enhancing content:', error);
    throw new Error('Failed to enhance content. Please try again.');
  }
}
