'use client';

import { useState, useRef, useEffect } from 'react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
  audioLoaded?: boolean;
}

interface StoredMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string; // ISO string for storage
  audioUrl?: string;
  audioLoaded?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Local storage key
  const STORAGE_KEY = 'voice-bridge-chat-history';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert Message to StoredMessage
  const messageToStored = (message: Message): StoredMessage => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  });

  // Convert StoredMessage to Message
  const storedToMessage = (stored: StoredMessage): Message => ({
    ...stored,
    timestamp: new Date(stored.timestamp),
  });

  // Save messages to local storage (keep last 4 conversations)
  const saveToLocalStorage = (messages: Message[]) => {
    try {
      const storedMessages = messages.map(messageToStored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  };

  // Load messages from local storage
  const loadFromLocalStorage = (): Message[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedMessages: StoredMessage[] = JSON.parse(stored);
        return storedMessages.map(storedToMessage);
      }
    } catch (error) {
      console.error('Failed to load from local storage:', error);
    }
    return [];
  };

  // Clear chat history
  const clearChat = async () => {
    setIsClearing(true);
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsClearing(false);
    }
  };

  // Handle audio loading state
  const handleAudioLoad = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, audioLoaded: true }
        : msg
    ));
  };

  // Load messages on component mount
  useEffect(() => {
    const savedMessages = loadFromLocalStorage();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveToLocalStorage(messages);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ur-PK'; // Urdu (Pakistan)

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-send the transcribed message
        sendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Reset textarea height
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = '48px';
      textarea.style.overflowY = 'hidden';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
          audioUrl: data.audioUrl,
          audioLoaded: false,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const maxHeight = 5 * 24; // 5 lines * 24px line height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    autoResizeTextarea(e.target);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] bg-[length:24px_24px] relative">
      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-200/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/Logo.png" 
              alt="Voice Bridge Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Voice Bridge</h1>
              <p className="text-sm text-gray-600">AI-powered conversations in Urdu</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Developers Section */}
            <div className="flex items-center space-x-3">
              {/* Developer 1 - Jawad */}
              <a
                href="https://www.linkedin.com/in/jawad-a-dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title="Jawad - LinkedIn"
                style={{ transitionDelay: '0ms' }}
              >
                <img
                  src="https://media.licdn.com/dms/image/v2/D4D03AQFIGpI0J2VYPg/profile-displayphoto-scale_400_400/B4DZlnOqgHHsAg-/0/1758373522699?e=1762387200&v=beta&t=G5STUhfSeo3fgpcnJvzVNeho6_R9Fn3eERS-yWsJ2Mw"
                  alt="Jawad"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              </a>
              
              {/* Developer 2 - Abdul Basit */}
              <a
                href="https://www.linkedin.com/in/connect-abdulbasit/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title="Abdul Basit - LinkedIn"
                style={{ transitionDelay: '0ms' }}
              >
                <img
                  src="https://media.licdn.com/dms/image/v2/D5603AQGGvE0wBcohgQ/profile-displayphoto-scale_400_400/B56ZmE8F3YHMAg-/0/1758871971029?e=1762387200&v=beta&t=aRyAAQd3mlkaqzpIjduGAXMXe-I38smm8lHCvspbluU"
                  alt="Abdul Basit"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              </a>
              
              {/* WhatsApp Number */}
              <a
                href="https://wa.me/923151072740"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
                title="You can also use our platform on this phone number on WhatsApp."
                style={{ transitionDelay: '0ms' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span className="font-medium">+92 315 1072740</span>
              </a>
            </div>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                disabled={isClearing}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear chat history"
              >
                {isClearing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Chat</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pb-32">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-gray-100">
                <img 
                  src="/Logo.png" 
                  alt="Voice Bridge Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Voice Bridge</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start a conversation with our AI assistant. You can type in Urdu or English, or use voice input for a more natural experience.
              </p>
              
              {/* Quick Start Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => sendMessage("آپ کیسے ہیں؟")}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">Greeting</div>
                  <div className="text-sm text-gray-600">آپ کیسے ہیں؟</div>
                </button>
                <button
                  onClick={() => sendMessage("What's the weather like today?")}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">Weather</div>
                  <div className="text-sm text-gray-600">What&apos;s the weather like today?</div>
                </button>
                <button
                  onClick={() => sendMessage("کیا آپ مجھے کچھ کہانی سن سکتے ہیں؟")}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">Story</div>
                  <div className="text-sm text-gray-600">کیا آپ مجھے کچھ کہانی سن سکتے ہیں؟</div>
                </button>
                <button
                  onClick={() => sendMessage("Tell me about Pakistan")}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">Information</div>
                  <div className="text-sm text-gray-600">Tell me about Pakistan</div>
                </button>
              </div>
              </div>
            </div>
          ) : (
          /* Messages */
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-6 py-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12'
                      : 'bg-white/80 backdrop-blur-sm text-gray-900 mr-12 shadow-sm border border-gray-200/50'
                  }`}
                >
                  {/* AI response - audio first, then text */}
                  {!message.isUser && message.audioUrl && (
                    <div className="mb-3">
                      {!message.audioLoaded ? (
                        <div className="flex items-center justify-center w-full h-8 bg-gray-100 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            </div>
                            <span className="text-xs text-gray-500">Loading audio...</span>
                          </div>
                        </div>
                      ) : (
                        <audio 
                          controls 
                          className="w-full h-8"
                        >
                          <source src={message.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                      {/* Hidden audio element to detect when it's loaded */}
                      <audio 
                        style={{ display: 'none' }}
                        onLoadedData={() => handleAudioLoad(message.id)}
                        onCanPlay={() => handleAudioLoad(message.id)}
                      >
                        <source src={message.audioUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  
                  {/* Text content */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                  
                  <p className={`text-xs mt-2 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-sm text-gray-900 px-6 py-4 rounded-2xl mr-12 shadow-sm border border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {isListening && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl ml-12">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    <span className="text-sm">Listening... Speak now</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Floating Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message in Urdu or English..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-lg min-h-[48px] overflow-hidden"
                rows={1}
                style={{ height: '48px' }}
              />
            </div>
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl h-[48px] w-[48px] flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>
            
            {/* Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl h-[48px] w-[48px] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
        </div>
        </div>
      </div>
    </div>
  );
}