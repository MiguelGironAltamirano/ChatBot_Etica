import { useState, useRef, useEffect, useCallback } from 'react'
import { endpoints } from '../services/api'
import type { Message } from '../types/chat'

// Mensajes de espera que se mostrarán si hay demora
const WAITING_MESSAGES = [
    "Estoy despertando, dame unos segundos... ☕",
    "Estoy iniciando, un momento por favor... 🌱",
    "Preparándome para ayudarte, ya casi... 💚"
]

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: '¡Hola! Soy ANMI, tu asistente nutricional. Te ayudaré con información sobre nutrición para prevenir la anemia infantil, siempre cuidando tu privacidad. 💚',
            isBot: true,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [slowResponseMessage, setSlowResponseMessage] = useState<string | null>(null)
    const threadIdRef = useRef(crypto.randomUUID())

    // Queue for smooth streaming
    const streamQueue = useRef<string[]>([])
    const isStreaming = useRef(false)
    const currentBotMessageId = useRef<string | number | null>(null)
    const slowResponseTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Process the stream queue
    useEffect(() => {
        const interval = setInterval(() => {
            if (streamQueue.current.length > 0 && currentBotMessageId.current) {
                const nextChunk = streamQueue.current.shift()
                if (nextChunk) {
                    setMessages(prev => {
                        const msgExists = prev.some(m => m.id === currentBotMessageId.current)
                        if (!msgExists) {
                            // Ocultamos el indicador de "escribiendo" apenas comienza a salir texto
                            setIsTyping(false)
                            // Ocultar mensaje de espera cuando llega la respuesta
                            setSlowResponseMessage(null)

                            return [...prev, {
                                id: currentBotMessageId.current!,
                                text: nextChunk,
                                isBot: true,
                                timestamp: new Date()
                            }]
                        }
                        return prev.map(msg =>
                            msg.id === currentBotMessageId.current
                                ? { ...msg, text: msg.text + nextChunk }
                                : msg
                        )
                    })
                }
            } else if (!isStreaming.current && streamQueue.current.length === 0 && currentBotMessageId.current) {
                // Stream finished and queue empty
                currentBotMessageId.current = null
            }
        }, 10) // Velocidad

        return () => clearInterval(interval)
    }, [])

    // Limpiar timer al desmontar
    useEffect(() => {
        return () => {
            if (slowResponseTimerRef.current) {
                clearTimeout(slowResponseTimerRef.current)
            }
        }
    }, [])

    const sendMessageToApi = async (text: string) => {
        setIsTyping(true)
        isStreaming.current = true
        setSlowResponseMessage(null)

        // Iniciar timer para mostrar mensaje de espera después de 3 segundos
        slowResponseTimerRef.current = setTimeout(() => {
            const randomMessage = WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)]
            setSlowResponseMessage(randomMessage)
        }, 3000)

        // Create a placeholder message for the bot response
        const botMessageId = crypto.randomUUID()
        currentBotMessageId.current = botMessageId

        // DO NOT add the empty bot message to the state immediately
        // setMessages(prev => [...prev, botResponse])

        try {
            const response = await fetch(endpoints.chatStream, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    thread_id: threadIdRef.current
                }),
            })

            if (!response.ok) {
                throw new Error('Error en la comunicación con el servidor')
            }

            if (!response.body) {
                throw new Error('No response body')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6)
                        if (dataStr === '[DONE]') continue

                        try {
                            const data = JSON.parse(dataStr)
                            if (data.token) {
                                // Push token to queue instead of updating state directly
                                // Split token into characters for smoother effect if it's a large chunk
                                // But usually tokens are small enough. 
                                // If the token is a whole word or more, we can push it as is, 
                                // or split it if we want super smooth char-by-char.
                                // Let's push it as is for now, but the interval will handle it.
                                // To make it smoother, we can split by character if the chunk is large.
                                if (data.token.length > 5) {
                                    const chars = data.token.split('')
                                    streamQueue.current.push(...chars)
                                } else {
                                    streamQueue.current.push(data.token)
                                }
                            }
                        } catch (e) {
                            console.warn('Error parsing SSE data:', e)
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error)
            // Remove the empty bot message and show error
            // The bot message is only added to state when the first chunk arrives,
            // so if an error occurs before that, there's nothing to filter out.
            // If it was partially streamed, we want to remove it.
            setMessages(prev => prev.filter(msg => msg.id !== botMessageId))
            currentBotMessageId.current = null

            const errorResponse: Message = {
                id: Date.now(),
                text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
                isBot: true,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorResponse])
        } finally {
            // Limpiar timer de respuesta lenta
            if (slowResponseTimerRef.current) {
                clearTimeout(slowResponseTimerRef.current)
                slowResponseTimerRef.current = null
            }
            setSlowResponseMessage(null)
            setIsTyping(false)
            isStreaming.current = false
        }
    }

    const handleSendMessage = useCallback(() => {
        if (inputValue.trim()) {
            const newMessage: Message = {
                id: crypto.randomUUID(),
                text: inputValue,
                isBot: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, newMessage])
            const textToSend = inputValue
            setInputValue('')
            sendMessageToApi(textToSend)
        }
    }, [inputValue])

    const handleQuickOption = useCallback((option: string) => {
        const newMessage: Message = {
            id: crypto.randomUUID(),
            text: option,
            isBot: false,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
        sendMessageToApi(option)
    }, [])

    return {
        messages,
        inputValue,
        setInputValue,
        isTyping,
        slowResponseMessage,
        handleSendMessage,
        handleQuickOption
    }
}
