import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BarChart3, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  text: string;
  count: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  created_by: string;
  expires_at?: string;
  allows_multiple: boolean;
  is_anonymous: boolean;
  created_at: string;
}

interface PollMessageProps {
  poll: Poll;
  isOwn?: boolean;
}

export function PollMessage({ poll, isOwn }: PollMessageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(poll.options);

  const totalVotes = pollOptions.reduce((sum, option) => sum + option.count, 0);
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const canVote = user && !isExpired && !isOwn;

  // Load user's existing votes
  useEffect(() => {
    if (!user || !poll.id) return;

    const loadUserVotes = async () => {
      const { data } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id);

      if (data) {
        setUserVotes(data.map(vote => vote.option_index));
      }
    };

    loadUserVotes();
  }, [poll.id, user]);

  // Real-time subscription for poll updates
  useEffect(() => {
    if (!poll.id) return;

    const subscription = supabase
      .channel(`poll:${poll.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `id=eq.${poll.id}`
        },
        (payload) => {
          if (payload.new && 'options' in payload.new && payload.new.options) {
            setPollOptions(payload.new.options as PollOption[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [poll.id]);

  const handleVote = async (optionIndex: number) => {
    if (!user || isVoting || !canVote) return;

    setIsVoting(true);
    try {
      // Check if user already voted for this option
      const alreadyVoted = userVotes.includes(optionIndex);
      
      if (alreadyVoted) {
        // Remove vote
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .eq('option_index', optionIndex);

        if (error) throw error;

        setUserVotes(prev => prev.filter(vote => vote !== optionIndex));
      } else {
        // Add vote (remove previous if single choice)
        if (!poll.allows_multiple && userVotes.length > 0) {
          await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', poll.id)
            .eq('user_id', user.id);
          
          setUserVotes([]);
        }

        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: poll.id,
            user_id: user.id,
            option_index: optionIndex
          });

        if (error) throw error;

        setUserVotes(prev => poll.allows_multiple ? [...prev, optionIndex] : [optionIndex]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Errore",
        description: "Errore nel voto al sondaggio",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (optionCount: number) => {
    return totalVotes > 0 ? (optionCount / totalVotes) * 100 : 0;
  };

  const formatTimeLeft = () => {
    if (!poll.expires_at) return null;
    
    const now = new Date();
    const expires = new Date(poll.expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Scaduto";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}g ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card className="p-4 space-y-4 max-w-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight">{poll.question}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {totalVotes} {totalVotes === 1 ? 'voto' : 'voti'}
            </span>
            {poll.expires_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTimeLeft()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {pollOptions.map((option, index) => {
          const percentage = getPercentage(option.count);
          const hasVoted = userVotes.includes(index);
          const showResults = !canVote || userVotes.length > 0;

          return (
            <div key={index} className="space-y-1">
              <Button
                variant={hasVoted ? "default" : "ghost"}
                className={`w-full justify-start text-left h-auto p-3 ${
                  !canVote ? 'cursor-default' : ''
                }`}
                onClick={() => canVote && handleVote(index)}
                disabled={isVoting || !canVote}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{option.text}</span>
                  {showResults && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {percentage.toFixed(0)}%
                      </span>
                      <Badge variant="secondary" className="text-xs px-1">
                        {option.count}
                      </Badge>
                    </div>
                  )}
                </div>
              </Button>
              
              {showResults && (
                <Progress value={percentage} className="h-1" />
              )}
            </div>
          );
        })}
      </div>

      {poll.allows_multiple && canVote && (
        <p className="text-xs text-muted-foreground">
          Puoi selezionare più opzioni
        </p>
      )}

      {isExpired && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Sondaggio scaduto</span>
        </div>
      )}
    </Card>
  );
}