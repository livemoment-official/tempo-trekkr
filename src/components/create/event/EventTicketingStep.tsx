import { Card, CardContent } from "@/components/ui/card";
import { AdvancedTicketingSystem } from "./AdvancedTicketingSystem";
import type { AdvancedTicketingData } from "./AdvancedTicketingSystem";
import { useArtists } from "@/hooks/useArtists";

interface EventTicketingStepProps {
  data: {
    advancedTicketing?: AdvancedTicketingData;
    selectedArtists: string[];
  };
  onChange: (updates: Partial<EventTicketingStepProps['data']>) => void;
}

export const EventTicketingStep = ({ data, onChange }: EventTicketingStepProps) => {
  const { data: artists } = useArtists();
  
  const handleTicketingChange = (ticketingData: AdvancedTicketingData) => {
    onChange({ advancedTicketing: ticketingData });
  };

  // Map selected artist IDs to full artist objects
  const selectedArtistObjects = artists?.filter(artist => 
    data.selectedArtists?.includes(artist.id)
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ticketing e Incassi</h2>
        <p className="text-muted-foreground">
          Configura il sistema di biglietteria e decidi come distribuire gli incassi agli artisti
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AdvancedTicketingSystem
            data={data.advancedTicketing}
            onChange={handleTicketingChange}
            selectedArtists={selectedArtistObjects}
          />
        </CardContent>
      </Card>
    </div>
  );
};
