import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, MapPin, Calendar, Star, Gift, Zap } from "lucide-react";

const mockUserStats = {
  totalInvitesSent: 25,
  totalMomentsCreated: 12,
  totalParticipations: 48,
  currentStreak: 7,
  level: 3,
  points: 1840,
  nextLevelPoints: 2500
};

const mockAchievements = [
  {
    id: 1,
    title: "Social Butterfly",
    description: "Invia 10 inviti in una settimana",
    icon: Users,
    unlocked: true,
    points: 100,
    unlockedAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Moment Creator",
    description: "Crea 5 momenti in un mese",
    icon: MapPin,
    unlocked: true,
    points: 150,
    unlockedAt: "2024-01-20"
  },
  {
    id: 3,
    title: "Community Builder",
    description: "Organizza 3 eventi con più di 10 partecipanti",
    icon: Calendar,
    unlocked: false,
    points: 300,
    progress: 1,
    target: 3
  },
  {
    id: 4,
    title: "Super Host",
    description: "Ottieni 50 reazioni positive sui tuoi momenti",
    icon: Star,
    unlocked: false,
    points: 250,
    progress: 23,
    target: 50
  }
];

const mockRewards = [
  {
    id: 1,
    title: "Badge Esclusivo",
    description: "Badge 'Early Adopter' sul profilo",
    cost: 500,
    type: "badge",
    available: true
  },
  {
    id: 2,
    title: "Boost Visibilità",
    description: "I tuoi momenti in evidenza per 24h",
    cost: 300,
    type: "boost",
    available: true
  },
  {
    id: 3,
    title: "Tema Premium",
    description: "Unlock tema scuro premium",
    cost: 800,
    type: "theme",
    available: false
  }
];

export default function Premi() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/premi";
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "rewards">("overview");

  const progressPercent = (mockUserStats.points / mockUserStats.nextLevelPoints) * 100;

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
                <CardTitle className="text-lg">Livello {mockUserStats.level}</CardTitle>
                <p className="text-sm text-muted-foreground">{mockUserStats.points} / {mockUserStats.nextLevelPoints} punti</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Streak {mockUserStats.currentStreak}
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
                  <p className="text-xl font-semibold text-primary">{mockUserStats.totalInvitesSent}</p>
                  <p className="text-xs text-muted-foreground">Inviti</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">{mockUserStats.totalMomentsCreated}</p>
                  <p className="text-xs text-muted-foreground">Momenti</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">{mockUserStats.totalParticipations}</p>
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
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm">Invita un amico</span>
                  </div>
                  <Badge variant="secondary">+10 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm">Crea un momento</span>
                  </div>
                  <Badge variant="secondary">+25 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm">Partecipa a un evento</span>
                  </div>
                  <Badge variant="secondary">+15 punti</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-sm">Ricevi una reazione</span>
                  </div>
                  <Badge variant="secondary">+5 punti</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-4">
            {mockAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className={achievement.unlocked ? "border-primary/30 bg-primary/5" : "opacity-60"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
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
                                style={{ width: `${(achievement.progress! / achievement.target!) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-primary mt-1">Sbloccato il {new Date(achievement.unlockedAt).toLocaleDateString('it-IT')}</p>
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
            {mockRewards.map((reward) => (
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
                        disabled={!reward.available || mockUserStats.points < reward.cost}
                        className="mt-2"
                      >
                        {mockUserStats.points >= reward.cost ? "Riscatta" : "Punti insufficienti"}
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