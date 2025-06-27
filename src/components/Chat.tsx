import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { askOpenAI, ChatMessage } from '../lib/openaiClient'

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Загрузить историю из Supabase
  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setMessages(data as ChatMessage[])
      })
  }, [])

  // Прокрутить вниз
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Сохранить в БД
    await supabase.from('messages').insert(userMsg)

    try {
      const botMsg = await askOpenAI([...messages, userMsg])
      setMessages(prev => [...prev, botMsg])
      await supabase.from('messages').insert(botMsg)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка при запросе API' }])
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '8px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: m.role === 'user' ? '#DCF8C6' : '#EEE',
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: 10, borderTop: '1px solid #ccc' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          placeholder="Напиши сообщение..."
        />
        <button type="submit" style={{ marginLeft: 8, padding: '0 16px' }}>
          Отправить
        </button>
      </form>
    </div>
  )
}
