import { Card, CardContent } from "@/components/ui/card";
import { AdvancedTicketingSystem } from "./AdvancedTicketingSystem";
import type { AdvancedTicketingData } from "./AdvancedTicketingSystem";

interface EventTicketingStepProps {
  data: {
    advancedTicketing?: AdvancedTicketingData;
    artists?: Array<{
      id: string;
      name: string;
      avatar_url?: string;
      stage_name?: string;
    }>;
  };
  onChange: (updates: Partial<EventTicketingStepProps['data']>) => void;
}

export const EventTicketingStep = ({ data, onChange }: EventTicketingStepProps) => {
  const handleTicketingChange = (ticketingData: AdvancedTicketingData) => {
    onChange({ advancedTicketing: ticketingData });
  };

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
            selectedArtists={data.artists || []}
          />
        </CardContent>
      </Card>
    </div>
  );
};
