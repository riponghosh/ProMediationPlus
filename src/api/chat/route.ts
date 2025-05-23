export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for a mediation dashboard. Help users navigate and use the dashboard effectively."
          },
          ...messages
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    
    return new Response(JSON.stringify({
      content: data.choices[0]?.message?.content || "I didn't get a response"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({
      error: 'Error processing your request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}