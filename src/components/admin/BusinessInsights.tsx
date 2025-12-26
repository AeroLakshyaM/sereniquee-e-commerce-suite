import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useProducts } from '@/hooks/useProducts';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EXPERT_PERSONA = `You are Priya Sharma, a highly experienced candle business consultant with 15 years of expertise in:
- Premium luxury candle manufacturing and artisan craftsmanship
- E-commerce and online retail strategies specifically for handcrafted products
- Digital marketing, social media, and brand positioning for luxury lifestyle brands
- Customer psychology and buying behavior in the home fragrance industry
- Pricing strategies, inventory management, and product portfolio optimization
- Seasonal trends, scent psychology, and market demand analysis
- Sustainable and eco-friendly business practices in candle making
- Gift market trends and corporate gifting opportunities

Your background:
- Started as a candle maker in 2008, grew business to multi-crore annual revenue
- Helped 50+ candle brands optimize their product lines and marketing
- Expert in natural soy wax, essential oils, and sustainable candle materials
- Deep understanding of Indian market preferences and international trends
- Specializes in helping family-run businesses scale effectively

Your communication style:
- Warm, encouraging, and supportive (like a mentor)
- Data-driven but easy to understand
- Practical and actionable advice, not just theory
- Honest about challenges but always solution-focused
- Uses examples and comparisons to make points clear
- Encourages innovation while respecting traditional craftsmanship`;

const ANALYSIS_PROMPT = `${EXPERT_PERSONA}

You are analyzing the Sereniquee Candles e-commerce business. Here's the current state:

**BUSINESS DATA:**
{business_data}

**PRODUCT CATALOG:**
{product_list}

**RECENT ORDERS:**
{orders_summary}

**YOUR TASK:**
Provide EXTREMELY DETAILED, comprehensive business insights and recommendations. Be thorough and specific in every section. Each section should be AT LEAST 3-5 substantial paragraphs with concrete examples.

Structure your response EXACTLY like this (use these exact headings):

## OVERALL BUSINESS HEALTH

Write 4-5 detailed paragraphs covering:
- Celebrate what's working well with specific examples from their products
- Identify any concerns with detailed explanations of WHY they matter
- Compare their business to industry standards
- Assess their growth trajectory with specific metrics
- Provide an encouraging summary of their potential

## PRODUCT PORTFOLIO ANALYSIS

For EACH product individually, provide:
- Detailed analysis of what makes it unique or concerning
- Pricing position (too high/low/perfect and WHY)
- Stock management assessment
- Marketing potential and customer appeal
- Specific improvement suggestions
Then add:
- Gap analysis: what products are missing from the portfolio
- Category balance assessment
- Product line coherence evaluation

## MARKETING & POSITIONING RECOMMENDATIONS

Provide 6-8 DETAILED paragraphs covering:
- Product photography improvement ideas (specific shots, styling, lighting)
- Product description enhancement (tone, keywords, storytelling approach)
- Social media content calendar suggestions (specific post ideas for each product)
- Instagram/Facebook strategy tailored to their products
- Seasonal campaign ideas (festivals, holidays, gifting occasions)
- Influencer collaboration strategies
- Customer testimonial usage tactics
- Email marketing sequence recommendations
- Competitor differentiation positioning

## IMMEDIATE ACTION ITEMS

List 7-10 prioritized actions for THIS WEEK. For each:
- WHY it matters (business impact)
- HOW to do it (step-by-step)
- WHAT success looks like (measurable outcome)
- TIME required (realistic estimate)
Be extremely specific and practical.

## GROWTH OPPORTUNITIES

Provide 5-7 DETAILED growth strategies:
- New product development ideas (specific scents, sizes, formats based on current portfolio)
- New customer segments with targeting strategies
- Corporate gifting program development
- Subscription box potential
- Workshop/experience offerings
- Wholesale/retail partnership approaches
- International market expansion considerations
Each with implementation roadmap and expected ROI.

## CUSTOMER EXPERIENCE IMPROVEMENTS

Write 5-6 detailed paragraphs about:
- Unboxing experience enhancement ideas
- Personalization opportunities
- Gift customization options
- Post-purchase follow-up strategies
- Loyalty program design
- Customer education content (candle care, scent selection)
- Community building tactics
- Customer feedback loop implementation

## FINANCIAL OPTIMIZATION

Provide detailed analysis of:
- Current pricing strategy assessment with specific recommendations
- Material cost optimization without quality compromise
- Bundle pricing strategies (suggest 4-5 specific bundle ideas)
- Seasonal pricing calendar
- Discount strategy guidance
- Shipping cost optimization
- Profit margin improvement tactics
- Revenue forecasting based on current trajectory

Be EXTREMELY detailed, encouraging, warm, and mentor-like. Use real examples from their actual products. Make every paragraph substantial with actionable insights. Think like a consultant who is paid ₹50,000 for this analysis - provide that level of value and detail!`;

export default function BusinessInsights() {
  const { data: products } = useProducts();
  const { data: orders } = useAdminOrders();
  const { toast } = useToast();
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const generateInsights = async () => {
    if (!products || products.length === 0) {
      toast({
        title: 'No data available',
        description: 'Add products first to get business insights.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Build comprehensive business data
      const totalProducts = products.length;
      const featuredProducts = products.filter(p => p.featured).length;
      const outOfStock = products.filter(p => p.stock_quantity === 0).length;
      const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
      const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
      const priceRange = {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
      };

      const businessData = `
Total Products: ${totalProducts}
Featured Products: ${featuredProducts}
Out of Stock: ${outOfStock}
Low Stock (≤5): ${lowStock}
Average Price: ₹${avgPrice.toFixed(2)}
Price Range: ₹${priceRange.min} - ₹${priceRange.max}
Categories: ${[...new Set(products.map(p => p.category).filter(Boolean))].join(', ') || 'Not categorized'}
      `.trim();

      const productList = products.map((p, i) => `
${i + 1}. ${p.name}
   - Category: ${p.category || 'Not set'}
   - Price: ₹${p.price}
   - Stock: ${p.stock_quantity} units
   - Featured: ${p.featured ? 'Yes' : 'No'}
   - Description: ${p.description || 'No description'}
   ${p.average_rating ? `- Rating: ${p.average_rating}/5 (${p.review_count} reviews)` : '- No reviews yet'}
      `).join('\n');

      const ordersData = orders && orders.length > 0 ? `
Total Orders: ${orders.length}
Recent Orders Status:
- Pending: ${orders.filter(o => o.status === 'pending').length}
- Processing: ${orders.filter(o => o.status === 'processing').length}
- Shipped: ${orders.filter(o => o.status === 'shipped').length}
- Delivered: ${orders.filter(o => o.status === 'delivered').length}
- Cancelled: ${orders.filter(o => o.status === 'cancelled').length}

Total Revenue: ₹${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
Average Order Value: ₹${(orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length).toFixed(2)}
      ` : 'No orders yet - This is a new store starting its journey!';

      const prompt = ANALYSIS_PROMPT
        .replace('{business_data}', businessData)
        .replace('{product_list}', productList)
        .replace('{orders_summary}', ordersData);

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192, // Maximum detailed response
        },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setInsights(text);
      setLastUpdated(new Date());
      
      toast({
        title: 'Insights Generated!',
        description: 'AI business consultant has analyzed your store.',
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate insights on first load if products exist
    if (products && products.length > 0 && !insights && !isLoading) {
      generateInsights();
    }
  }, [products?.length]); // Only re-run if product count changes

  const parseInsights = () => {
    if (!insights) return {};

    const sections: Record<string, string> = {};
    // Split by markdown headers (##)
    const parts = insights.split(/^## /gm).filter(Boolean);
    
    parts.forEach((part) => {
      const lines = part.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      if (title && content) {
        sections[title] = content;
      }
    });

    return sections;
  };

  const sections = parseInsights();
  const sectionKeys = Object.keys(sections);

  // Set first section as active when sections are loaded
  useEffect(() => {
    if (sectionKeys.length > 0 && activeSection === 'overview') {
      setActiveSection(sectionKeys[0]);
    }
  }, [sectionKeys.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif mb-2">AI Business Consultant</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Expert insights powered by 15 years of candle business experience
                </p>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={generateInsights}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="text-lg font-medium">Analyzing your business...</p>
              <p className="text-sm text-muted-foreground">
                Our AI consultant is reviewing your products, orders, and market position
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Display */}
      {!isLoading && insights && (
        <Card>
          <CardContent className="p-6">
            {sectionKeys.length > 0 ? (
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
                  {sectionKeys.slice(0, 7).map((key, index) => (
                    <TabsTrigger 
                      key={index} 
                      value={key}
                      className="text-xs"
                    >
                      {key.includes('OVERALL') && <TrendingUp className="h-3 w-3 mr-1" />}
                      {key.includes('PRODUCT') && <Lightbulb className="h-3 w-3 mr-1" />}
                      {key.includes('ACTION') && <AlertCircle className="h-3 w-3 mr-1" />}
                      {key.includes('GROWTH') && <CheckCircle className="h-3 w-3 mr-1" />}
                      <span className="hidden sm:inline">{key.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sectionKeys.map((key, index) => (
                  <TabsContent key={index} value={key} className="space-y-4">
                    <div className="border-l-4 border-purple-600 pl-4 mb-6 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 py-4">
                      <h3 className="font-serif text-2xl font-bold mb-1">{key}</h3>
                      <p className="text-xs text-muted-foreground">Detailed analysis and recommendations</p>
                    </div>
                    <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-purple-900 dark:prose-headings:text-purple-100 prose-p:leading-relaxed prose-li:leading-relaxed">
                      <div className="whitespace-pre-wrap text-foreground text-[15px] leading-[1.8] space-y-4">
                        {sections[key].split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                {insights}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !insights && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Lightbulb className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium mb-2">No insights yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Refresh Insights" to get personalized business recommendations
                </p>
                <Button onClick={generateInsights} className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                About Your AI Business Consultant
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                This AI consultant has been trained with 15 years of candle business expertise, covering manufacturing, 
                marketing, e-commerce, and customer psychology. It analyzes your real-time data and provides personalized, 
                actionable advice to help grow your business.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
