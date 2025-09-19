import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, MapPin, Calendar, Star, Gift, Zap } from "lucide-react";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

// Icon mapping for achievement types
const achievementIcons = {
  'profile_complete': Users,
  'first_moment': MapPin,
  'social_butterfly': Users,
  'group_creator': Calendar,
  'network_builder': Users,
  'event_host': Calendar,
  'community_star': Star,
  default: Trophy
};

export default function Premi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    loading, 
    stats, 
    achievements, 
    pointHistory, 
    rewards, 
    redeemReward 
  } = useUserAchievements();
  
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/premi";
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "rewards">("overview");

  if (!isAuthenticated) {
    return (
      <AuthGuard title="Accedi per vedere i tuoi premi" description="Accedi per visualizzare i tuoi progressi e riscattare premi esclusivi">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Accedi per vedere i tuoi premi</p>
        </div>
      </AuthGuard>
    );
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#FFFCEF]">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-[#FFFCEF]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">Premi</h1>
            <div className="w-10" />
          </div>
        </header>
        
        <div className="px-5 py-4 space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (stats.totalPoints / stats.nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-[#FFFCEF]">
      <Helmet>
        <title>LiveMoment · Premi</title>
        <meta name="description" content="Guadagna punti e sblocca premi creando momenti e invitando amici." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-[#FFFCEF]/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Premi</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-4 space-y-6">
        {/* User Stats Overview */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Livello {stats.currentLevel}</CardTitle>
                <p className="text-sm text-muted-foreground">{stats.totalPoints} / {stats.nextLevelPoints} punti</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Streak {stats.currentStreak}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-semibold text-primary">{stats.totalInvitesSent}</p>
                  <p className="text-xs text-muted-foreground">Inviti</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">{stats.totalMomentsCreated}</p>
                  <p className="text-xs text-muted-foreground">Momenti</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">{stats.totalParticipations}</p>
                  <p className="text-xs text-muted-foreground">Partecipazioni</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            Attività
          </Button>
          <Button
            variant={activeTab === "achievements" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("achievements")}
            className="flex-1"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Obiettivi
          </Button>
          <Button
            variant={activeTab === "rewards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("rewards")}
            className="flex-1"
          >
            <Gift className="h-4 w-4 mr-2" />
            Premi
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Come guadagnare punti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm">Crea un momento</span>
                  </div>
                  <Badge variant="secondary">+100 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm">Nuova amicizia</span>
                  </div>
                  <Badge variant="secondary">+25 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm">Crea un gruppo (5+ persone)</span>
                  </div>
                  <Badge variant="secondary">+200 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-sm">Completa obiettivo</span>
                  </div>
                  <Badge variant="secondary">+50-300 punti</Badge>
                </div>
                
                {pointHistory.length > 0 && (
                  <>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Attività Recenti</h4>
                      <div className="space-y-2">
                        {pointHistory.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{transaction.reason}</span>
                            <Badge variant={transaction.points > 0 ? "default" : "secondary"} className="text-xs">
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const IconComponent = achievementIcons[achievement.achievementType as keyof typeof achievementIcons] || achievementIcons.default;
              return (
                <Card key={achievement.id} className={achievement.unlocked ? "border-primary/30 bg-primary/5" : "opacity-60"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                        <IconComponent className={`h-5 w-5 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{achievement.title}</h3>
                          <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                            {achievement.points} punti
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                        {!achievement.unlocked && achievement.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progresso</span>
                              <span>{achievement.progress}/{achievement.target}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full"
                                style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-primary mt-1">
                            Sbloccato il {new Date(achievement.unlockedAt).toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={!reward.available ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{reward.cost} punti</p>
                      <Button
                        size="sm"
                        disabled={!reward.available || stats.totalPoints < reward.cost}
                        onClick={() => redeemReward(reward.id, reward.cost)}
                        className="mt-2"
                      >
                        {stats.totalPoints >= reward.cost ? "Riscatta" : "Punti insufficienti"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}