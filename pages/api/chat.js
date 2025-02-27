// Прокси для OpenRouter API
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Проверка метода
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { messages, model } = req.body;
    
    // API ключ берется из переменных окружения
    const API_KEY = process.env.OPENROUTER_API_KEY || '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';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://ton618.vercel.app',
        'X-Title': 'TON618 Chat'
      },
      body: JSON.stringify({
        model: model || 'nvidia/llama-3.1-nemotron-70b-instruct:free',
        messages: messages,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
