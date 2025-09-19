import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  Mic, 
  BarChart3, 
  Plus,
  X,
  Upload
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface PollOption {
  text: string;
  count: number;
}

interface ChatMediaPickerProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'poll', data?: any) => void;
  disabled?: boolean;
}

export function ChatMediaPicker({ onSendMessage, disabled }: ChatMediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '', count: 0 },
    { text: '', count: 0 }
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendFile = async (type: 'image' | 'video' | 'audio') => {
    if (!selectedFile) return;
    
    await onSendMessage('', type, { file: selectedFile });
    setSelectedFile(null);
    setOpen(false);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { text: '', count: 0 }]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, text: string) => {
    const updated = [...pollOptions];
    updated[index] = { ...updated[index], text };
    setPollOptions(updated);
  };

  const handleSendPoll = () => {
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.text.trim()).length < 2) {
      return;
    }

    const validOptions = pollOptions
      .filter(opt => opt.text.trim())
      .map(opt => ({ text: opt.text.trim(), count: 0 }));

    onSendMessage('', 'poll', {
      question: pollQuestion.trim(),
      options: validOptions
    });

    setPollQuestion('');
    setPollOptions([{ text: '', count: 0 }, { text: '', count: 0 }]);
    setOpen(false);
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' | null => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invia Contenuto</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="poll" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sondaggio
            </TabsTrigger>
          </TabsList>

          {/* Media Upload Tab */}
          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Foto</span>
                </div>
                <input 
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </Label>

              <Label htmlFor="video-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Video</span>
                </div>
                <input 
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </Label>

              <Label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <Mic className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Audio</span>
                </div>
                <input 
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </Label>
            </div>

            {selectedFile && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">File selezionato:</span>
                  <Badge variant="secondary">{getFileType(selectedFile)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{selectedFile.name}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      const type = getFileType(selectedFile);
                      if (type) handleSendFile(type);
                    }}
                    className="flex-1"
                  >
                    Invia {getFileType(selectedFile)}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFile(null)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Poll Tab */}
          <TabsContent value="poll" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="poll-question">Domanda del Sondaggio</Label>
              <Textarea
                id="poll-question"
                placeholder="Scrivi la tua domanda..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Opzioni</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Opzione ${index + 1}...`}
                    value={option.text}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    className="flex-1"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePollOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {pollOptions.length < 6 && (
                <Button
                  variant="outline"
                  onClick={addPollOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Opzione
                </Button>
              )}
            </div>

            <Button
              onClick={handleSendPoll}
              disabled={
                !pollQuestion.trim() || 
                pollOptions.filter(opt => opt.text.trim()).length < 2
              }
              className="w-full"
            >
              Crea Sondaggio
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}