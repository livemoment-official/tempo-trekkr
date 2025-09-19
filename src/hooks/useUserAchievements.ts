import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  nextLevelPoints: number;
  totalInvitesSent: number;
  totalMomentsCreated: number;
  totalParticipations: number;
}

export interface Achievement {
  id: string;
  achievementType: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}

export interface PointTransaction {
  id: string;
  points: number;
  reason: string;
  referenceType?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: string;
  available: boolean;
}

export const useUserAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Badge Esclusivo',
      description: 'Badge "Early Adopter" sul profilo',
      cost: 500,
      type: 'badge',
      available: true
    },
    {
      id: '2',
      title: 'Boost Visibilità',
      description: 'I tuoi momenti in evidenza per 24h',
      cost: 300,
      type: 'boost',
      available: true
    },
    {
      id: '3',
      title: 'Tema Premium',
      description: 'Unlock tema scuro premium',
      cost: 800,
      type: 'theme',
      available: true
    }
  ]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get profile data with gamification stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_level, current_streak')
        .eq('id', user.id)
        .single();

      // Get moments count
      const { count: momentsCount } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id);

      // Get invites count
      const { count: invitesCount } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id);

      // Get participations count
      const { count: participationsCount } = await supabase
        .from('moment_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const totalPoints = profile?.total_points || 0;
      const currentLevel = profile?.current_level || 1;
      
      setStats({
        totalPoints,
        currentLevel,
        currentStreak: profile?.current_streak || 0,
        nextLevelPoints: currentLevel * 500, // Every 500 points = 1 level
        totalInvitesSent: invitesCount || 0,
        totalMomentsCreated: momentsCount || 0,
        totalParticipations: participationsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedAchievements: Achievement[] = data.map(achievement => ({
        id: achievement.id,
        achievementType: achievement.achievement_type,
        title: achievement.title,
        description: achievement.description,
        points: achievement.points,
        unlocked: achievement.unlocked,
        progress: achievement.progress || 0,
        target: achievement.target || 1,
        unlockedAt: achievement.unlocked_at
      }));

      setAchievements(formattedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchPointHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedHistory: PointTransaction[] = data.map(transaction => ({
        id: transaction.id,
        points: transaction.points,
        reason: transaction.reason,
        referenceType: transaction.reference_type,
        createdAt: transaction.created_at
      }));

      setPointHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching point history:', error);
    }
  };

  const redeemReward = async (rewardId: string, cost: number) => {
    if (!user || !stats) return;

    if (stats.totalPoints < cost) {
      toast({
        title: "Punti insufficienti",
        description: "Non hai abbastanza punti per riscattare questo premio.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deduct points (add negative points transaction)
      const { error } = await supabase.rpc('add_user_points', {
        target_user_id: user.id,
        points_amount: -cost,
        reason: `Riscatto premio: ${rewards.find(r => r.id === rewardId)?.title}`,
        ref_type: 'reward_redemption'
      });

      if (error) throw error;

      // Refresh stats
      await fetchUserStats();
      
      toast({
        title: "Premio riscattato!",
        description: "Il tuo premio è stato riscattato con successo.",
      });
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il riscatto del premio.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchUserStats(),
          fetchAchievements(),
          fetchPointHistory()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  return {
    loading,
    stats,
    achievements,
    pointHistory,
    rewards,
    redeemReward,
    refreshStats: fetchUserStats
  };
};