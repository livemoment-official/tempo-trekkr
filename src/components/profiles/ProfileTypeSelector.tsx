import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, MapPin, Users } from 'lucide-react';
import type { ProfileType } from '@/hooks/useUserProfiles';

interface ProfileTypeSelectorProps {
  onSelectType: (type: ProfileType) => void;
  className?: string;
}

const profileTypes = [
  {
    type: 'artist' as ProfileType,
    icon: Music,
    title: 'Artista',
    description: 'Crea il tuo profilo artistico per essere trovato dagli organizzatori',
    color: 'bg-primary/10 text-primary border-primary/20',
    iconColor: 'text-primary'
  },
  {
    type: 'venue' as ProfileType,
    icon: MapPin,
    title: 'Location',
    description: 'Metti a disposizione il tuo spazio per eventi e momenti',
    color: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
    iconColor: 'text-secondary-foreground'
  },
  {
    type: 'staff' as ProfileType,
    icon: Users,
    title: 'Staff',
    description: 'Offri i tuoi servizi professionali per eventi',
    color: 'bg-accent/10 text-accent-foreground border-accent/20',
    iconColor: 'text-accent-foreground'
  }
];

export function ProfileTypeSelector({ onSelectType, className }: ProfileTypeSelectorProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {profileTypes.map(({ type, icon: Icon, title, description, color, iconColor }) => (
        <Card
          key={type}
          className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${color}`}
          onClick={() => onSelectType(type)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 rounded-full bg-background/50`}>
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm opacity-80">{description}</p>
              </div>

              <Badge variant="secondary" className="mt-2">
                Crea profilo
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}