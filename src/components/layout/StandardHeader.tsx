import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandardHeaderProps {
  title: string;
  onBack?: () => void;
  rightActions?: ReactNode;
}

export default function StandardHeader({ title, onBack, rightActions }: StandardHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-b">
      <div className="container h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        
        {rightActions && (
          <div className="shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </header>
  );
}
