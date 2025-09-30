import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Users, DollarSign, Percent, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
export interface TicketPhase {
  name: string;
  price: number;
  maxTickets: number;
}
export interface ArtistSplit {
  artistId: string;
  paymentType: 'none' | 'percentage' | 'fixed';
  percentage: number;
  fixedAmount: number;
}
export interface AdvancedTicketingData {
  enabled: boolean;
  currency: 'EUR' | 'USD' | 'GBP';
  phases: TicketPhase[];
  artistSplits?: ArtistSplit[];
}
interface AdvancedTicketingSystemProps {
  data?: AdvancedTicketingData;
  onChange: (data: AdvancedTicketingData) => void;
  selectedArtists?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    stage_name?: string;
  }>;
}
export const AdvancedTicketingSystem = ({
  data,
  onChange,
  selectedArtists = []
}: AdvancedTicketingSystemProps) => {
  const [ticketingData, setTicketingData] = useState<AdvancedTicketingData>(data || {
    enabled: false,
    currency: 'EUR',
    phases: [],
    artistSplits: []
  });
  const LIVEMOMENT_FEE = 5; // 5% fee

  // Initialize artist splits when artists change
  useEffect(() => {
    if (selectedArtists.length > 0 && (!ticketingData.artistSplits || ticketingData.artistSplits.length === 0)) {
      const initialSplits: ArtistSplit[] = selectedArtists.map(artist => ({
        artistId: artist.id,
        paymentType: 'none',
        percentage: 0,
        fixedAmount: 0
      }));
      updateData({
        artistSplits: initialSplits
      });
    }
  }, [selectedArtists]);
  const updateData = (updates: Partial<AdvancedTicketingData>) => {
    const newData = {
      ...ticketingData,
      ...updates
    };
    setTicketingData(newData);
    onChange(newData);
  };
  useEffect(() => {
    if (data) {
      setTicketingData(data);
    }
  }, [data]);
  const addPhase = () => {
    const newPhase: TicketPhase = {
      name: ticketingData.phases.length === 0 ? 'Early Bird' : ticketingData.phases.length === 1 ? 'Regular' : 'Last Minute',
      price: 0,
      maxTickets: 0
    };
    updateData({
      phases: [...ticketingData.phases, newPhase]
    });
  };
  const updatePhase = (index: number, updates: Partial<TicketPhase>) => {
    const newPhases = ticketingData.phases.map((phase, i) => i === index ? {
      ...phase,
      ...updates
    } : phase);
    updateData({
      phases: newPhases
    });
  };
  const removePhase = (index: number) => {
    const newPhases = ticketingData.phases.filter((_, i) => i !== index);
    updateData({
      phases: newPhases
    });
  };
  const updateArtistSplit = (artistId: string, updates: Partial<ArtistSplit>) => {
    const newSplits = (ticketingData.artistSplits || []).map(split => split.artistId === artistId ? {
      ...split,
      ...updates
    } : split);
    updateData({
      artistSplits: newSplits
    });
  };
  const calculateBreakdown = (price: number) => {
    const livemomentFee = price * LIVEMOMENT_FEE / 100;
    let artistsTotal = 0;
    (ticketingData.artistSplits || []).forEach(split => {
      if (split.paymentType === 'percentage') {
        artistsTotal += price * split.percentage / 100;
      } else if (split.paymentType === 'fixed') {
        artistsTotal += split.fixedAmount / 100;
      }
    });
    const organizerAmount = price - livemomentFee - artistsTotal;
    return {
      livemomentFee,
      artistsTotal,
      organizerAmount
    };
  };
  const getTotalPercentageAllocated = () => {
    let total = LIVEMOMENT_FEE;
    (ticketingData.artistSplits || []).forEach(split => {
      if (split.paymentType === 'percentage') {
        total += split.percentage;
      }
    });
    return total;
  };
  const currencySymbol = ticketingData.currency === 'EUR' ? '€' : ticketingData.currency === 'USD' ? '$' : '£';
  return;
};