import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { EnhancedLocationSearch } from "@/components/location/EnhancedLocationSearch";

interface DateLocationStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function DateLocationStep({ data, onChange, onNext }: DateLocationStepProps) {
  const [time, setTime] = useState("");

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange({ ...data, date });
    }
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number; address?: string }) => {
    onChange({ 
      ...data, 
      location: {
        name: location.name,
        address: location.address || location.name,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      } 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.date && data.location?.name?.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-medium">Quando *</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Seleziona data e orario del momento
        </p>
        
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date picker */}
          <div>
            <Label htmlFor="date">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-2"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.date ? format(data.date, "PPP", { locale: it }) : "Seleziona data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data.date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div>
            <Label htmlFor="time">Orario</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">
          Dove *
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Cerca e seleziona il luogo del momento
        </p>
        
        <div className="mt-3">
          <EnhancedLocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Es. Bar Central, Via Roma 123, Milano"
            value={data.location?.name || ""}
          />
        </div>
        
        {data.location?.address && (
          <p className="text-xs text-muted-foreground mt-2">
            📍 {data.location.address}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!data.date || !data.location?.name?.trim()}
        >
          Continua
        </Button>
      </div>
    </form>
  );
}