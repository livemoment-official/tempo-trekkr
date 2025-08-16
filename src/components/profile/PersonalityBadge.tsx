import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PersonalityBadgeProps {
  type: string | null;
  className?: string;
}

const personalityData = {
  // Analysts
  'INTJ': { label: 'Architetto', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🏛️' },
  'INTP': { label: 'Pensatore', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🧠' },
  'ENTJ': { label: 'Comandante', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: '👑' },
  'ENTP': { label: 'Innovatore', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '💡' },
  
  // Diplomats
  'INFJ': { label: 'Avvocato', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🌱' },
  'INFP': { label: 'Mediatore', color: 'bg-green-100 text-green-800 border-green-200', icon: '🕊️' },
  'ENFJ': { label: 'Protagonista', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '⭐' },
  'ENFP': { label: 'Attivista', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: '🎨' },
  
  // Sentinels
  'ISTJ': { label: 'Logistico', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📋' },
  'ISFJ': { label: 'Protettore', color: 'bg-sky-100 text-sky-800 border-sky-200', icon: '🛡️' },
  'ESTJ': { label: 'Dirigente', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '📊' },
  'ESFJ': { label: 'Console', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🤝' },
  
  // Explorers
  'ISTP': { label: 'Virtuoso', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🔧' },
  'ISFP': { label: 'Avventuriero', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🎭' },
  'ESTP': { label: 'Imprenditore', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚡' },
  'ESFP': { label: 'Intrattenitore', color: 'bg-pink-100 text-pink-800 border-pink-200', icon: '🎪' }
};

export const PersonalityBadge = ({ type, className }: PersonalityBadgeProps) => {
  if (!type || !personalityData[type as keyof typeof personalityData]) return null;
  
  const personality = personalityData[type as keyof typeof personalityData];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(personality.color, "text-xs font-medium", className)}
    >
      <span className="mr-1">{personality.icon}</span>
      {personality.label}
    </Badge>
  );
};