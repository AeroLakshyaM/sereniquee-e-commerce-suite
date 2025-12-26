import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are Sereniquee's AI assistant, representing a premium luxury candle brand. Here's what you need to know:

**About Sereniquee Candles:**
- Premium handcrafted luxury candles made with 100% natural soy wax
- Each candle is artisan-crafted with attention to detail
- We offer a range of exquisite scents including lavender, vanilla, sandalwood, citrus, rose, and more
- Our candles feature cotton wicks for clean burning
- Eco-friendly and sustainable materials
- Perfect for creating ambiance, relaxation, meditation, or as luxury gifts
- Available in various sizes and decorative containers
- All products are hand-poured in small batches to ensure quality

**Product Variants:**
- Multiple sizes available (small, medium, large)
- Different scent profiles (floral, woody, citrus, herbal)
- Various color options
- Wick types (single, double, wooden)
- Custom engraving available on select products
- Gift wrapping and premium packaging options available

**Business Values:**
- Quality craftsmanship over mass production
- Natural and sustainable ingredients
- Creating moments of tranquility and peace
- Supporting local artisans
- Eco-conscious packaging
- Customer satisfaction is our priority

**Gift Services:**
- Beautiful gift wrapping (+₹50)
- Custom gift messages and greeting cards (+₹30)
- Premium gift boxes (+₹100)
- Direct shipping to recipients
- Hide price options available

**Customer Experience:**
- Easy online shopping
- Secure payment options
- Fast shipping across India
- WhatsApp support available
- Wishlist and favorites for future purchases
- Product reviews and ratings from verified customers

**Your Role:**
- Be warm, friendly, and knowledgeable
- Help customers find the perfect candle for their needs
- Answer questions about products, ingredients, and care
- Provide gift suggestions and recommendations
- Assist with order inquiries
- Share candle care tips (trim wick to 1/4", burn for 2-4 hours, etc.)
- Be concise but informative
- If you don't know something specific, offer to connect them with customer support

Keep responses conversational, helpful, and aligned with the premium, luxurious brand image. Use emojis sparingly and appropriately. Always be polite and professional.`;

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Welcome to Sereniquee Candles! I\'m here to help you find the perfect luxury candle. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Build conversation history for context
      const conversationHistory = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${conversationHistory}\n\nUser: ${userMessage.content}\n\nAssistant:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or contact our support team via WhatsApp.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Icon Button */}
      <div
        className="fixed bottom-6 right-6 z-[100] group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        <div
          className={`absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg transition-all duration-200 ${
            isHovered && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}
        >
          Chat with Sereniquee AI
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-foreground" />
        </div>

        {/* Chat Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle chat"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-background border rounded-lg shadow-2xl flex flex-col z-[100] animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Sereniquee Assistant</h3>
                <p className="text-xs text-primary-foreground/80">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
