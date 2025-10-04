import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NotificationToastProps {
  title: string;
  message: string;
  userName?: string;
  userAvatar?: string;
  type?: 'reaction' | 'comment' | 'follow' | 'general';
}

export function NotificationToast({ 
  title, 
  message, 
  userName, 
  userAvatar, 
  type = 'general' 
}: NotificationToastProps) {
  const getIcon = () => {
    switch(type) {
      case 'reaction': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      default: return '🔔';
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-red-500 text-white rounded-lg shadow-lg min-w-[280px]">
      {userName && userAvatar && (
        <Avatar className="h-10 w-10 border-2 border-white shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-white/20 text-white">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getIcon()}</span>
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-sm text-white/90 leading-snug">
          {userName ? `${userName} ${message.toLowerCase().replace('qualcuno', '').replace('ti ha', 'ha')}` : message}
        </p>
      </div>
    </div>
  );
}
