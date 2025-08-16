import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { format } from "date-fns";
import { it } from "date-fns/locale";
interface InviteDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function InviteDetailsStep({
  data,
  onChange,
  onNext
}: InviteDetailsStepProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange({
        ...data,
        date
      });
    }
  };
  const handleLocationChange = (name: string, coordinates?: { lat: number; lng: number }) => {
    onChange({
      ...data,
      location: {
        name,
        coordinates: coordinates ? [coordinates.lat, coordinates.lng] : null
      }
    });
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Dettagli dell'invito</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Specifica quando e dove per il tuo {data.activity.title.toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start mt-2">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.date ? format(data.date, "PPP", {
                locale: it
              }) : "Seleziona data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={data.date} onSelect={handleDateSelect} disabled={date => date < new Date()} />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="time">Orario</Label>
          <Input id="time" type="time" className="mt-2" />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Dove</Label>
        <div className="mt-2">
          <LocationSearchInput
            value={data.location.name}
            onChange={handleLocationChange}
            placeholder="Suggerisci un posto..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Messaggio personalizzato</Label>
        <Textarea id="message" value={data.message} onChange={e => onChange({
        ...data,
        message: e.target.value
      })} placeholder={`Ciao! Che ne dici di un ${data.activity.title.toLowerCase()} insieme?`} className="mt-2" rows={3} />
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continua
        </Button>
      </div>
    </div>;
}