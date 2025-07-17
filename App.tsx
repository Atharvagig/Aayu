import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender } from './types';
import { initializeTts, speak, cancelSpeech } from './services/ttsService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import WelcomeScreen from './components/WelcomeScreen';

interface CustomWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
declare const window: CustomWindow;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = SpeechRecognition != null;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isVoiceChatActive, setIsVoiceChatActive] = useState<boolean>(false);
  
  const hasStartedChat = messages.length > 0;
  const recognitionRef = useRef<any>(null);
  const isProcessingTurnRef = useRef<boolean>(false);
  const isVoiceChatActiveRef = useRef(isVoiceChatActive);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isVoiceChatActiveRef.current = isVoiceChatActive;
  }, [isVoiceChatActive]);

  const startListening = useCallback(() => {
    if (isVoiceChatActiveRef.current && !isProcessingTurnRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
          console.log("Recognition start attempted while already running. Ignoring.");
        } else {
          console.error("Could not start recognition:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    initializeTts();
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (isLoading || !text.trim()) return;

    setIsLoading(true);
    setError(null);
    if(abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = { id: Date.now(), text, sender: Sender.User };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    
    const aiMessageId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: aiMessageId, text: '', sender: Sender.AI }]);
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: currentMessages, language }),
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'API request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Could not read response stream.');
        }

        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulatedText += decoder.decode(value, { stream: true });
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
                )
            );
        }
        
        if (isVoiceChatActiveRef.current && accumulatedText) {
            await speak(accumulatedText, language);
        }

    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Fetch aborted.');
        return;
      }
      console.error(e);
      const errorMessage = "Aayu is having a little trouble connecting. Please try again.";
      setError(errorMessage);
      setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: errorMessage, isError: true } : msg));
    } finally {
      setIsLoading(false);
      if (isVoiceChatActiveRef.current) {
        isProcessingTurnRef.current = false;
        startListening();
      }
    }
  }, [messages, isLoading, language, startListening]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;
    
    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript && !isProcessingTurnRef.current) {
                isProcessingTurnRef.current = true;
                handleSendMessage(transcript);
            }
        };

        recognition.onend = () => {
            startListening();
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error('Voice Chat Speech recognition error:', event.error);
            }
        };
    }
    
    if (isVoiceChatActive) {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        startListening();
    } else {
        recognitionRef.current?.stop();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceChatActive, language, handleSendMessage, startListening]);

  const handleVoiceChatToggle = () => {
    if (!hasStartedChat) return;
    setIsVoiceChatActive(prev => {
        const nextState = !prev;
        if (!nextState) {
            cancelSpeech();
        } else {
            isProcessingTurnRef.current = false;
        }
        return nextState;
    });
  };

  const handleLanguageChange = (lang: 'en' | 'hi') => {
      setLanguage(lang);
      setMessages([]);
      setIsVoiceChatActive(false);
      setError(null);
  };

  return (
    <div className="flex flex-col h-screen font-sans antialiased max-w-3xl mx-auto bg-brand-surface shadow-2xl shadow-slate-200/50">
      <Header 
        language={language}
        onLanguageChange={handleLanguageChange}
        isVoiceChatActive={isVoiceChatActive}
        onVoiceChatToggle={handleVoiceChatToggle}
        hasStartedChat={hasStartedChat}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {hasStartedChat ? (
          <ChatWindow messages={messages} isLoading={isLoading && !isVoiceChatActive} />
        ) : (
          <WelcomeScreen onSendMessage={handleSendMessage} language={language} />
        )}
      </div>
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!hasStartedChat || isVoiceChatActive}
        language={language}
        isVoiceChatActive={isVoiceChatActive}
      />
      {error && !isLoading && (
        <div className="text-center p-2 text-sm text-red-500 bg-red-50 border-t border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default App;