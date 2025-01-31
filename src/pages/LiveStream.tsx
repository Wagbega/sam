import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { MessageCircle, Share2, Heart, Volume2, X, ChevronDown, Radio } from 'lucide-react';
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
  const [showStreamMenu, setShowStreamMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isMobile] = useState(window.innerWidth <= 768);
  const [viewerCount] = useState(Math.floor(Math.random() * 500) + 300);

  // Close stream menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-stream-menu]') && !target.closest('[data-stream-button]')) {
        setShowStreamMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast.error('Failed to load live streams');
        console.error('Error fetching streams:', error);
        return;
      }

      const streamsMap: Record<string, Stream> = {};
      data?.forEach((stream: Stream) => {
        if (stream.url.includes('youtube.com/watch?v=')) {
          stream.url = stream.url.replace('watch?v=', 'embed/');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to live stream...</p>
        </div>
      </div>
    );
  }

  if (!activeStream || Object.keys(streams).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Live Streams Available</h2>
          <p className="text-gray-600">Please check back later for upcoming services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-grow">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Stream Controls */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  {/* Stream Selector Dropdown */}
                  <div className="relative" data-stream-menu>
                    <button
                      onClick={() => setShowStreamMenu(!showStreamMenu)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      data-stream-button
                    >
                      <Radio className="h-4 w-4" />
                      <span>{streams[activeStream]?.name || 'Select Stream'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {showStreamMenu && (
                      <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border">
                        {Object.values(streams).map((stream) => (
                          <button
                            key={stream.id}
                            onClick={() => {
                              setActiveStream(stream.id);
                              setShowStreamMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 ${
                              activeStream === stream.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                            }`}
                          >
                            {stream.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stream Stats & Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 text-gray-600">
                      <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">LIVE</span>
                        <span className="text-sm text-gray-500">{viewerCount.toLocaleString()} watching</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setShowShare(!showShare)}
                        data-share-button
                      >
                        <Share2 className="h-5 w-5 text-gray-600" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setShowChat(!showChat)}
                      >
                        {showChat ? 
                          <X className="h-5 w-5 text-gray-600" /> : 
                          <MessageCircle className="h-5 w-5 text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Player with Gradient Overlay when Loading */}
              <div className="relative w-full h-0 pb-[56.25%] bg-gradient-to-r from-indigo-900 to-purple-900">
                <div className="absolute inset-0">
                  {streams[activeStream]?.name === 'FM Mode' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
                      <div className="w-3/4 max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-sm">
                        <audio
                          src={streams[activeStream]?.url}
                          controls
                          autoPlay={playing}
                          className="w-full"
                          playsInline
                          controlsList="nodownload"
                          preload="auto"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  ) : (
                    <ReactPlayer
                      url={streams[activeStream]?.url}
                      width="100%"
                      height="100%"
                      controls
                      playing={playing}
                      playsinline
                      config={{
                        youtube: {
                          playerVars: {
                            playsinline: 1,
                            modestbranding: 1,
                            origin: window.location.origin,
                            enablejsapi: 1,
                            rel: 0
                          }
                        }
                      }}
                      onError={(e) => {
                        console.error('Player error:', e);
                        toast.error('Error playing media');
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Stream Info with Enhanced Design */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {streams[activeStream]?.name}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {streams[activeStream]?.description}
                </p>
                
                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">Service Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { day: 'Sunday', time: '9:00 AM', name: 'Morning Service' },
                      { day: 'Sunday', time: '11:00 AM', name: 'Main Service' },
                      { day: 'Wednesday', time: '7:00 PM', name: 'Bible Study' },
                    ].map((service, index) => (
                      <div key={index} className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-semibold text-indigo-600 mb-1">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.day} at {service.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Live Chat */}
          {showChat && activeStream && (
            <div className="fixed inset-x-0 bottom-0 lg:relative lg:w-96 z-50 lg:z-0 h-[70vh] lg:h-auto">
              <div className="bg-white shadow-xl lg:shadow-lg h-full lg:h-[600px] flex flex-col rounded-t-xl lg:rounded-xl border border-gray-100">
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                  <h3 className="font-bold text-gray-900">Live Chat</h3>
                  <button 
                    onClick={() => setShowChat(false)}
                    className="lg:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
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

      {/* Share Menu */}
      {showShare && handleShare()}
    </div>
  );
}
