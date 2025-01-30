// LiveStream.tsx
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { MessageCircle, Share2, Heart, Volume2, X } from 'lucide-react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import LiveChat from '../components/LiveChat';

interface Stream {
  id: string;
  name: string;
  url: string;
  description: string;
}

export default function LiveStream() {
  const [streams, setStreams] = useState<Record<string, Stream>>({});
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile detection with resize handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true);

      if (error) {
        setError('Failed to load live streams');
        console.error('Error fetching streams:', error);
        toast.error('Failed to load live streams');
        return;
      }

      const streamsMap: Record<string, Stream> = {};
      data?.forEach((stream: Stream) => {
        // Enhanced URL handling for mobile
        if (stream.url.includes('youtube.com/watch?v=')) {
          const videoId = stream.url.split('v=')[1]?.split('&')[0];
          stream.url = isMobile 
            ? `https://www.youtube.com/embed/${videoId}?playsinline=1`
            : stream.url;
        }
        streamsMap[stream.id] = stream;
      });

      setStreams(streamsMap);
      if (data && data.length > 0) {
        setActiveStream(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to load live streams');
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const title = activeStream ? `Live Service at ${streams[activeStream].name}` : 'Live Service';
    
    return (
      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-2 z-50">
        <div className="flex flex-col space-y-2">
          <FacebookShareButton 
            url={shareUrl} 
            quote={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on Facebook
            </div>
          </FacebookShareButton>
          
          <TwitterShareButton 
            url={shareUrl} 
            title={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on Twitter
            </div>
          </TwitterShareButton>
          
          <WhatsappShareButton 
            url={shareUrl} 
            title={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on WhatsApp
            </div>
          </WhatsappShareButton>
        </div>
      </div>
    );
  };

  // Handle clicks outside share menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-share-menu]') && !target.closest('[data-share-button]')) {
        setShowShare(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderPlayer = () => {
    if (!activeStream || !streams[activeStream]) {
      return null;
    }

    if (streams[activeStream].name === 'FM Mode') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
          <audio
            src={streams[activeStream].url}
            controls
            autoPlay={playing}
            className="w-3/4 max-w-md"
            playsInline
            controlsList="nodownload"
            preload="auto"
            onError={() => {
              setError('Error playing audio stream');
              toast.error('Error playing audio stream');
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={streams[activeStream].url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    return (
      <ReactPlayer
        url={streams[activeStream].url}
        width="100%"
        height="100%"
        controls={true}
        playing={playing}
        playsinline={true}
        config={{
          youtube: {
            playerVars: {
              playsinline: 1,
              modestbranding: 1,
              origin: window.location.origin,
              enablejsapi: 1,
              rel: 0,
              controls: 1,
              showinfo: 0,
              iv_load_policy: 3,
              fs: 1,
              'webkit-playsinline': 1,
            }
          },
          file: {
            attributes: {
              playsInline: true,
              webkitPlaysinline: true,
              controlsList: 'nodownload',
              'webkit-playsinline': true,
              playsinline: true,
              controls: true,
              preload: 'auto',
            },
            forceVideo: true,
            forceDASH: false,
            hlsOptions: {
              enableWorker: true,
              autoStartLoad: true,
              startPosition: -1,
            },
          }
        }}
        onError={(e) => {
          console.error('Player error:', e);
          setError('Error playing video stream');
          toast.error('Error playing video stream');
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onBuffer={() => console.log('Buffering...')}
        onBufferEnd={() => console.log('Buffering ended')}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchStreams}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!activeStream || Object.keys(streams).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Live Streams Available</h2>
          <p className="text-gray-600">Please check back later for upcoming services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-grow">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Stream Controls */}
              <div className="border-b p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                    {Object.values(streams).map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => {
                          setActiveStream(stream.id);
                          setPlaying(true);
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          activeStream === stream.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {stream.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-end space-x-4 text-gray-600">
                    <button 
                      className="p-2 hover:text-indigo-600"
                      onClick={() => setPlaying(!playing)}
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 hover:text-indigo-600 relative"
                      onClick={() => setShowShare(!showShare)}
                      data-share-button
                    >
                      <Share2 className="h-5 w-5" />
                      {showShare && handleShare()}
                    </button>
                    <button 
                      className="p-2 hover:text-red-600"
                      onClick={() => setShowChat(!showChat)}
                    >
                      {showChat ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>
              </div>

              {/* Video/Audio Player */}
              <div className="relative w-full h-0 pb-[56.25%] bg-black">
                <div className="absolute inset-0">
                  {renderPlayer()}
                </div>
              </div>
              
              {/* Stream Info */}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{streams[activeStream]?.name}</h2>
                <p className="text-gray-600 mb-6">{streams[activeStream]?.description}</p>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Service Times:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { day: 'Sunday', time: '9:00 AM', name: 'Morning Service' },
                      { day: 'Sunday', time: '11:00 AM', name: 'Main Service' },
                      { day: 'Wednesday', time: '7:00 PM', name: 'Bible Study' },
                    ].map((service, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-indigo-600">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.day} at {service.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          {showChat && activeStream && (
            <div className="fixed inset-x-0 bottom-0 lg:relative lg:w-96 z-50 lg:z-0 h-[70vh] lg:h-auto">
              <div className="bg-white shadow-lg lg:shadow-md h-full lg:h-[600px] flex flex-col rounded-t-xl lg:rounded-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Live Chat</h3>
                  <button 
                    onClick={() => setShowChat(false)}
                    className="lg:hidden p-2 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <LiveChat streamId={activeStream} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
