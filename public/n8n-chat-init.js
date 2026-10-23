import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
  webhookUrl: 'https://sereniqueecandles.app.n8n.cloud/webhook/109c2a00-bdce-4581-bb97-0947148d2100/chat',
  mode: 'window',
  showWelcomeScreen: false,
  initialMessages: [
    'Welcome to Sereniquee Candles ✨',
    'I can help you pick the right scent, customize festive & wedding favors, or place an order directly in chat. What mood or occasion are you shopping for today?'
  ],
  i18n: {
    en: {
      title: 'Sereniquee Scent Concierge ✨',
      subtitle: 'Handcrafted Luxury Candles',
      inputPlaceholder: 'Ask for scents, prices, or place an order...'
    }
  }
});
