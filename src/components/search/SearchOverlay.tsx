import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { AdvancedSearchModal } from "./AdvancedSearchModal";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchOverlay = ({ open, onOpenChange }: SearchOverlayProps) => {
  const [q, setQ] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Ricerca
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca persone, momenti, eventi, luoghi…"
              aria-label="Campo di ricerca"
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowAdvanced(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Tabs defaultValue="tutti">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="tutti">Tutti</TabsTrigger>
              <TabsTrigger value="persone">Persone</TabsTrigger>
              <TabsTrigger value="momenti">Momenti</TabsTrigger>
              <TabsTrigger value="eventi">Eventi</TabsTrigger>
            </TabsList>
            <TabsContent value="tutti" className="text-sm text-muted-foreground">
              Digita per iniziare a cercare. I risultati appariranno qui.
            </TabsContent>
            <TabsContent value="persone" className="text-sm text-muted-foreground">
              Nessun risultato. Prova con un nome o @username.
            </TabsContent>
            <TabsContent value="momenti" className="text-sm text-muted-foreground">
              Nessun momento trovato.
            </TabsContent>
            <TabsContent value="eventi" className="text-sm text-muted-foreground">
              Nessun evento trovato.
            </TabsContent>
          </Tabs>
        </div>
        
        <AdvancedSearchModal
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          onSearch={(filters) => {
            console.log("Advanced search filters:", filters);
            // TODO: Implement search logic
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
