import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileCard } from "@/components/profile/UserProfileCard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function Esplora() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/esplora";

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const availableNowQ = useQuery({
    queryKey: ["available_now"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_now")
        .select("availability_id, user_id, username, name, avatar_url, interests, mood, job_title, start_at, end_at")
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const eventsQ = useQuery({
    queryKey: ["events", "discover"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, place, when_at, tags")
        .eq("discovery_on", true)
        .order("when_at", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const momentsQ = useQuery({
    queryKey: ["moments", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("id, title, when_at, tags")
        .eq("is_public", true)
        .order("when_at", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const suggestedProfilesQ = useQuery({
    queryKey: ["suggested_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("privacy_level", "public")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const onSend = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Placeholder call: the edge function will be implemented after API key is set
      const { data, error } = await supabase.functions.invoke("ai-explore", {
        body: { messages: next },
      });
      if (error) throw error;
      const answer = data?.generatedText || data?.reply || "Ecco alcuni suggerimenti vicino a te.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (_e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "AI non ancora configurata. Intanto ecco alcune idee: guarda persone disponibili ora ed eventi consigliati sotto.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>LiveMoment · Esplora consigli e persone</title>
        <meta name="description" content="Chatta per consigli personalizzati e scopri persone disponibili, eventi, locali e attività vicino a te." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Esplora</h1>

      {/* Chat */}
      <section className="space-y-3">
        <div className="rounded-md border p-3">
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Chiedimi: "Stasera live vicino a me", "Persone disponibili ora", "Aperitivo con musica a Milano"…
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <span className="inline-block rounded-md bg-muted px-2 py-1 text-sm">{m.content}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder="Cosa ti va di fare?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              aria-label="Scrivi una richiesta"
            />
            <Button onClick={onSend} disabled={loading}>{loading ? "…" : "Invia"}</Button>
          </div>
        </div>
      </section>

      {/* Feed */}
      <div className="space-y-6">
        <Section title="Persone disponibili ora">
          <div className="grid grid-cols-2 gap-3">
            {availableNowQ.data?.map((p: any) => (
              <Card key={p.availability_id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted" aria-label="avatar" />
                    <div>
                      <div className="text-sm font-medium">{p.name || p.username || "Utente"}</div>
                      <div className="text-xs text-muted-foreground">{p.mood || p.job_title || "Disponibile"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {availableNowQ.data?.length === 0 && (
              <div className="text-sm text-muted-foreground">Nessuno disponibile in questo momento.</div>
            )}
          </div>
        </Section>

        <Section title="Persone da scoprire">
          <div className="space-y-3">
            {suggestedProfilesQ.data?.map((profile: any) => (
              <UserProfileCard 
                key={profile.id} 
                profile={profile} 
                compact={true}
                onFollow={() => console.log('Follow', profile.username)}
                onMessage={() => console.log('Message', profile.username)}
              />
            ))}
            {suggestedProfilesQ.data?.length === 0 && (
              <div className="text-sm text-muted-foreground">Nessun profilo suggerito al momento.</div>
            )}
          </div>
        </Section>

        <Section title="Eventi in zona">
          <div className="space-y-3">
            {eventsQ.data?.map((e: any) => (
              <Card key={e.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.when_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(e.tags || []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {eventsQ.data?.length === 0 && (
              <div className="text-sm text-muted-foreground">Nessun evento consigliato al momento.</div>
            )}
          </div>
        </Section>

        <Section title="Momenti pubblici">
          <div className="space-y-3">
            {momentsQ.data?.map((m: any) => (
              <Card key={m.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(m.when_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(m.tags || []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {momentsQ.data?.length === 0 && (
              <div className="text-sm text-muted-foreground">Ancora nessun momento pubblico vicino.</div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
