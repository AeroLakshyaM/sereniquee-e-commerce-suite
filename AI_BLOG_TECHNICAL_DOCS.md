# AI Blog Generator - Technical Documentation

## Overview

The AI Blog Generator uses Google's Gemini 1.5 Flash model to automatically generate SEO-optimized blog content for Sereniquee Candles e-commerce website. This feature is designed to help non-technical users create professional blog posts without writing skills.

## Architecture

### Files Created/Modified

1. **`src/lib/geminiAI.ts`** - Core AI integration utility
2. **`src/components/admin/BlogManager.tsx`** - Updated with AI generation UI
3. **`.env`** - Contains `VITE_GEMINI_API_KEY`

### Key Components

#### 1. Gemini AI Utility (`geminiAI.ts`)

```typescript
export interface BlogGenerationInput {
  topic: string;
  additionalNotes?: string;
}

export interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}

export async function generateBlogContent(input: BlogGenerationInput): Promise<GeneratedBlogContent>
```

**Features:**
- Uses `gemini-1.5-flash` model for fast generation
- Generates 800-1200 word blog posts
- Creates SEO-friendly titles (50-60 characters)
- Generates compelling excerpts (120-160 characters)
- Produces 5-8 relevant tags
- Handles JSON response parsing (removes code block markers)
- Error handling with user-friendly messages

**Prompt Engineering:**
- Brand-aware (Sereniquee context)
- Tone: warm, personal, maternal
- SEO optimization built-in
- Structured content with subheadings
- Short paragraphs for readability
- Includes call-to-action
- Natural keyword integration

#### 2. BlogManager Component Updates

**New State:**
```typescript
const [aiTopic, setAiTopic] = useState('');
const [aiNotes, setAiNotes] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
```

**New Function:**
```typescript
const handleAIGenerate = async () => {
  // Validates input
  // Calls generateBlogContent()
  // Populates form state with generated content
  // Shows success/error toast
  // Clears AI input fields
}
```

**UI Features:**
- Prominent card with gradient background
- Clear instructions for non-technical users
- Topic input with helpful examples
- Optional additional notes field
- Loading state during generation
- Step-by-step guide in amber info box
- Disabled state during generation

## User Flow

1. User opens Admin > Blog tab
2. Sees AI Blog Generator card at top
3. Enters topic: "How to care for scented candles"
4. Optionally adds notes: "Mention soy wax, trim wick to 1/4 inch"
5. Clicks "Generate Blog Post with AI"
6. Waits 10-15 seconds (shows loading spinner)
7. Form below auto-fills with:
   - Title: "5 Essential Tips to Care for Your Scented Candles"
   - Content: ~1000 word structured blog post
   - Excerpt: 2-sentence summary
   - Tags: "candle care, scented candles, home tips, soy candles"
8. User reviews/edits content as needed
9. User uploads cover image and gallery images
10. User clicks "Publish Blog"
11. Blog saves to Supabase database

## API Integration

### Environment Variable
```env
VITE_GEMINI_API_KEY=AIzaSyCkrGrG9Me38fa3ELXUKK8k6TgFmw5zyw8
```

### Model Used
- **Model**: `gemini-1.5-flash`
- **Provider**: Google Generative AI
- **Speed**: ~10-15 seconds per generation
- **Cost**: Free tier (60 requests per minute)

### Request Format
```typescript
{
  topic: string,           // Required: Main blog topic
  additionalNotes: string  // Optional: Extra context
}
```

### Response Format
```json
{
  "title": "SEO-optimized title (50-60 chars)",
  "content": "Full blog post with \\n\\n paragraph breaks",
  "excerpt": "2-sentence summary (120-160 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
```

## SEO Features

### Automatic Optimization
1. **Title SEO**: 50-60 characters, includes keywords
2. **Content SEO**: 
   - Natural keyword integration
   - Structured with H2/H3 headings
   - 800-1200 words (ideal length)
   - Short paragraphs (2-4 sentences)
3. **Tags**: Relevant, lowercase, searchable
4. **Excerpt**: Compelling meta description length

### Example Generated Tags
```javascript
["candle care", "aromatherapy", "home decor", "self care", 
 "handmade", "luxury candles", "soy wax", "wellness"]
```

## Error Handling

### Validation Errors
- Empty topic → Toast: "Topic required"
- API key missing → Console error

### Generation Errors
- Network failure → Toast: "Generation failed. Please try again."
- JSON parse error → Fallback with default values
- Timeout → User can retry

### Error Messages
All user-facing errors use friendly language:
```typescript
toast({
  title: 'Generation failed',
  description: 'Please try again.',
  variant: 'destructive'
});
```

## Content Quality Guidelines

### Prompt Instructions to AI:
- Write in warm, conversational tone
- Use storytelling for emotional connection
- Include practical tips and how-tos
- Mention seasonal themes where relevant
- Connect to home ambiance and wellness
- Keep paragraphs short and scannable
- Use transitions between sections
- End with call-to-action or reflection

### Content Structure:
```
Introduction (2-3 paragraphs)
├─ Hook the reader
├─ Preview the content
└─ Personal/brand connection

Section 1: [Subheading]
├─ Explanation
├─ Tips/examples
└─ Relevance to candles

Section 2: [Subheading]
├─ Explanation
├─ Tips/examples
└─ Relevance to candles

... (3-5 sections total)

Conclusion (2-3 paragraphs)
├─ Summary
├─ Emotional reflection
└─ Call-to-action
```

## Database Integration

Generated content saves to `blogs` table:
```sql
{
  title: string,
  slug: string (auto-generated),
  content: string,
  excerpt: string,
  tags: string[],
  reading_time: number (auto-calculated),
  cover_image_url: string (user uploads),
  gallery_image_urls: string[] (user uploads),
  author_name: string (user edits),
  is_published: boolean,
  published_at: timestamp
}
```

## Performance

- **Generation Time**: 10-15 seconds average
- **Rate Limit**: 60 requests/minute (Gemini free tier)
- **Caching**: None (each generation is unique)
- **Optimization**: Uses lightweight `flash` model instead of `pro`

## Future Enhancements

### Potential Features:
1. **Image Generation**: Auto-generate blog cover images
2. **Multi-language**: Support for other languages
3. **Content Enhancement**: Improve existing drafts
4. **Tone Selector**: Formal/casual/playful options
5. **Length Options**: Short (500w) / Medium (1000w) / Long (1500w)
6. **Template System**: Pre-made structures (How-to, Listicle, Story)
7. **Auto-publish Schedule**: Generate and schedule multiple posts
8. **SEO Score**: Real-time SEO analysis of generated content

## Maintenance

### Monitoring:
- Check API key validity monthly
- Monitor generation failure rate
- Review user feedback on content quality

### Updates:
- Update prompt as brand voice evolves
- Adjust content length based on engagement metrics
- Add new tags based on trending keywords

## Security

- API key stored in environment variables (not committed to Git)
- No sensitive data sent to Gemini API
- User authentication required (admin-only feature)
- Rate limiting handled by Gemini SDK

## Testing Recommendations

1. **Topic Variations**: Test with different topic lengths and specificity
2. **Edge Cases**: Empty input, very long input, special characters
3. **Multiple Generations**: Ensure uniqueness across multiple calls
4. **Content Review**: Human review of 10-20 generated posts
5. **SEO Validation**: Check titles/excerpts meet length requirements
6. **Mobile Testing**: Ensure UI works on mobile devices

## Support

For issues or questions:
1. Check browser console for errors
2. Verify `VITE_GEMINI_API_KEY` is set
3. Ensure internet connection is stable
4. Try refreshing the page
5. Test with simpler topic description

---

**Last Updated**: December 28, 2025
**Version**: 1.0.0
**Author**: Development Team
