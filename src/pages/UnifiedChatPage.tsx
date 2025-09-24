import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatFullscreen from './ChatFullscreen';
import GroupChat from './GroupChat';
import MomentChat from './MomentChat';
import CityChat from './CityChat';

export default function UnifiedChatPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate chat type and id
    if (!type || !id) {
      navigate('/gruppi');
      return;
    }
  }, [type, id, navigate]);

  // Route to appropriate chat component based on type
  switch (type) {
    case 'group':
      return <GroupChat />;
    case 'moment':
      return <MomentChat />;
    case 'city':
      return <CityChat />;
    case 'conversation':
    case 'friend':
      return <ChatFullscreen />;
    default:
      navigate('/gruppi');
      return null;
  }
}