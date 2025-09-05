import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QuickEditFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  type?: 'input' | 'textarea';
  placeholder?: string;
  onUpdate: (fieldKey: string, value: string) => void;
  className?: string;
}

export function QuickEditField({ 
  label, 
  value, 
  fieldKey, 
  type = 'input', 
  placeholder,
  onUpdate,
  className 
}: QuickEditFieldProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          [fieldKey]: editValue.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      onUpdate(fieldKey, editValue.trim());
      setIsEditing(false);
      toast.success('Campo aggiornato');
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'input') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="flex items-start gap-2">
          {type === 'textarea' ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 min-h-[60px]"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
              autoFocus
            />
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group cursor-pointer transition-smooth hover:bg-muted/30 -m-2 p-2 rounded-md ${className}`} onClick={() => setIsEditing(true)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-sm mt-1">
            {value ? (
              <span>{value}</span>
            ) : (
              <span className="text-muted-foreground italic">
                {placeholder || `Aggiungi ${label.toLowerCase()}`}
              </span>
            )}
          </div>
        </div>
        <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}