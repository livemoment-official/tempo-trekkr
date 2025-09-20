import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';

interface QuickAvailabilitySelectorProps {
  onSetAvailable: (hours: number) => void;
  isLoading: boolean;
  isActive: boolean;
}

const DURATION_OPTIONS = [
  { value: '1', label: '1 ora', hours: 1 },
  { value: '2', label: '2 ore', hours: 2 },
  { value: '4', label: '4 ore', hours: 4 },
  { value: '8', label: 'Fino a stasera', hours: 8 },
];

export function QuickAvailabilitySelector({ onSetAvailable, isLoading, isActive }: QuickAvailabilitySelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState('4'); // Default 4 hours
  
  const handleSetAvailable = () => {
    const option = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
    if (option) {
      onSetAvailable(option.hours);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
          <SelectTrigger className="h-8 text-xs border-disponibile-uscire/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={handleSetAvailable} 
        disabled={isLoading} 
        size="sm" 
        className={`h-8 px-3 text-xs ${
          isActive 
            ? 'bg-disponibile-uscire hover:bg-disponibile-uscire/90 text-disponibile-uscire-foreground' 
            : 'bg-disponibile-uscire hover:bg-disponibile-uscire/90 text-white'
        }`}
      >
        <Zap className="w-3 h-3 mr-1" />
        Disponibile ora
      </Button>
    </div>
  );
}