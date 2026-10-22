import { supabase } from '@/integrations/supabase/client';

export interface BlogGenerationInput { topic: string; additionalNotes?: string }
export interface GeneratedBlogContent { title: string; content: string; excerpt: string; tags: string[]; seoTitle: string; seoDescription: string; seoKeywords: string }

async function callAI(body: Record<string, unknown>, requiresAdmin: boolean) {
  let authorization: Record<string, string> = {};
  if (requiresAdmin) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new Error('Please sign in as an administrator to use AI tools.');
    authorization = { Authorization: `Bearer ${data.session.access_token}` };
  }
  const response = await fetch('/api/ai-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authorization },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'AI request failed. Please try again.');
  return result;
}

export async function generateBlogContent(input: BlogGenerationInput): Promise<GeneratedBlogContent> {
  const result = await callAI({ action: 'blog-generate', ...input }, true);
  return result.generated;
}

export async function enhanceExistingContent(existingContent: string, instructions: string): Promise<string> {
  const result = await callAI({ action: 'blog-enhance', content: existingContent, instructions }, true);
  return result.text;
}

export async function generateBusinessInsights(input: { businessData: string; productList: string; ordersSummary: string }): Promise<string> {
  const result = await callAI({ action: 'business-insights', ...input }, true);
  return result.text;
}

export async function sendChatMessage(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  const result = await callAI({ action: 'chat', messages }, false);
  return result.text;
}
