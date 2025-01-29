import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Send, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface Props {
  streamId: string;
  onClose?: () => void;
  videoUrl?: string;
  audioUrl?: string;
}

export default function LiveStreamPlayer({ streamId, onClose, videoUrl, audioUrl }: Props) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    checkAuth();
    loadRecentMessages();
    initializeMedia();

    const subscription = subscribeToChat();
    return () => {
      subscription.unsubscribe();
    };
  }, [streamId]);

  const initializeMedia = () => {
    // Initialize video playback
    if (videoRef.current) {
      videoRef.current.playsInline = true;
      videoRef.current.addEventListener('canplay', () => {
        videoRef.current?.play().catch(error => {
          console.error('Video autoplay failed:', error);
        });
      });
    }

    // Initialize audio playback
    if (audioRef.current) {
      audioRef.current.playsInline = true;
      audioRef.current.addEventListener('canplay', () => {
        audioRef.current?.play().catch(error => {
          console.error('Audio autoplay failed:', error);
        });
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Live Stream',
      text: 'Check out this live stream!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const loadRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('stream_chat')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages((data || []).reverse());
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  const subscribeToChat = () => {
    return supabase
      .channel(`stream_chat:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chat',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          const newMessage = payload.new as LiveChatMessage;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to chat');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to chat');
        return;
      }

      const { error } = await supabase
        .from('stream_chat')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          message: message.trim()
        });

      if (error) {
        if (error.code === '42501') {
          toast.error('You do not have permission to send messages');
        } else {
          throw error;
        }
        return;
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className= "flex flex-col h-full" >
    {/* Media Players */ }
    < div className = "relative w-full" >
      { videoUrl && (
        <video
            ref={ videoRef }
  className = "w-full"
  controls
  playsInline
  controlsList = "nodownload"
  src = { videoUrl }
    />
        )
}

{
  audioUrl && (
    <audio
            ref={ audioRef }
  className = "w-full"
  controls
  playsInline
  controlsList = "nodownload"
  src = { audioUrl }
    />
        )
}

<button
          onClick={ handleShare }
className = "absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg"
  >
  <Share2 className="h-5 w-5" />
    </button>
    </div>

{/* Chat Section */ }
<div 
        className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar"
ref = { chatContainerRef }
  >
  {
    messages.map((msg) => (
      <div key= { msg.id } className = "flex items-start space-x-3 animate-fade-in" >
      <div className="flex-shrink-0" >
    {
      msg.profiles?.avatar_url ? (
        <img
                  src= { msg.profiles.avatar_url }
                  alt={ msg.profiles.username }
                  className="h-8 w-8 rounded-full"
      />
              ) : (
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center" >
      <User className="h-4 w-4 text-indigo-600" />
      </div>
      )}
</div>
  < div className = "flex-grow min-w-0" >
    <div className="flex items-baseline space-x-2" >
      <span className="font-medium text-gray-900 truncate" >
        { msg.profiles?.username || 'Anonymous' }
        </span>
        < span className = "text-xs text-gray-500" >
          { new Date(msg.created_at).toLocaleTimeString() }
          </span>
          </div>
          < p className = "text-gray-700 break-words" > { msg.message } </p>
            </div>
            </div>
        ))}
<div ref={ messagesEndRef } />
  </div>

{/* Chat Input */ }
<form onSubmit={ handleSubmit } className = "p-4 border-t sticky bottom-0 bg-white" >
  <div className="flex space-x-2" >
    <input
            type="text"
value = { message }
onChange = {(e) => setMessage(e.target.value)}
placeholder = { isAuthenticated? "Type a message...": "Sign in to chat" }
className = "flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
disabled = {!isAuthenticated || isLoading}
style = {{ WebkitAppearance: 'none' }}
          />
  < button
type = "submit"
disabled = {!isAuthenticated || isLoading}
className = "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
  >
  <Send className="h-4 w-4" />
    <span className="hidden sm:inline" > Send </span>
      </button>
      </div>
{
  !isAuthenticated && (
    <p className="mt-2 text-sm text-gray-500 text-center" >
      Please sign in to participate in the chat
        </p>
        )
}
</form>
  </div>
  );
}
