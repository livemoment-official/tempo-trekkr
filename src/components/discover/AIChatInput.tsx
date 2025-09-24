import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function AIChatInput({ onSendMessage, disabled }: AIChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array)
        .map(byte => String.fromCharCode(byte))
        .join('');
      const base64Audio = btoa(binaryString);

      // Send to transcription service
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data?.text) {
        // Send the transcribed text as a message
        onSendMessage(data.text);
        toast({
          title: "Audio trascritto",
          description: "Il tuo messaggio vocale è stato inviato!",
        });
      } else {
        throw new Error('Nessun testo trascritto');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Errore trascrizione",
        description: "Non è stato possibile trascrivere l'audio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Voice Recorder */}
        <VoiceRecorder 
          onSendRecording={handleVoiceRecording}
          disabled={disabled || isTranscribing}
        />
        
        {/* Text Input */}
        <div className="flex-1 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isTranscribing ? "Trascrizione in corso..." : "Scrivi un messaggio..."}
            disabled={disabled || isTranscribing}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || disabled || isTranscribing}
            size="icon"
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}