export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
  }
  
  const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY!
  
  export async function askOpenAI(messages: ChatMessage[]) {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const json = await res.json()
    return json.choices[0].message as ChatMessage
  }
  