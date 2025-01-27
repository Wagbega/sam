import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, MapPin, Clock, Phone, Mail, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChurchInfo {
  id: string;
  section: string;
  title: string;
  content: string;
  order: number;
}

export default function About() {
  const [sections, setSections] = useState<ChurchInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChurchInfo();
  }, []);

  const fetchChurchInfo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('church_info')
        .select('*')
        .order('order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching church info:', error);
      toast.error('Failed to load church information');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading church information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:20px_20px] opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Welcome to Idasa Model Parish
          </h1>
          <p className="text-xl sm:text-2xl text-indigo-100 max-w-3xl mx-auto">
            A place to connect, worship, and grow in faith together
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-12">
          {/* Church Info Sections */}
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {section.title}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  {section.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Service Times */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Service Times
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { day: 'Sunday', time: '9:00 AM', name: 'Bible Study' },
                  { day: 'Sunday', time: '10:00 AM', name: 'Main Service' },
                  { day: 'Wednesday', time: '9:00 AM', name: 'Midweek Service' },
                  { day: 'Last Wednesday', time: '9:00 AM', name: 'Special Service' },
                  { day: 'First Saturday', time: '6:30 AM', name: 'Youth Prayer' },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <h3 className="font-semibold text-indigo-600 mb-1">{service.name}</h3>
                    <p className="text-gray-600">
                      {service.day} at {service.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location and Contact */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <MapPin className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Visit Us
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Location</h3>
                  <p className="text-gray-600 mb-4">
                    U41 Adelegan Ojo Omole Way, Idasa Street<br />
                    Ilesa, Osun State, Nigeria<br />
                    Landmark: Near Central Market
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-2 text-indigo-600" />
                      <span>+234 803 817 0800 (Secretary)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-2 text-indigo-600" />
                      <span>info@idasamodelparish.org</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Heart className="h-6 w-6 text-indigo-600 mr-2" />
                    Get Involved
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We'd love to have you join our church family. Visit us this Sunday and experience
                    God's love in a welcoming community.
                  </p>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Plan Your Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}