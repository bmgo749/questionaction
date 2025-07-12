import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Users, Globe, Lock, Shield } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { Layout } from '@/components/Layout';
import { CreateGuildModal } from '@/components/CreateGuildModal';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface Guild {
  id: number;
  name: string;
  description: string;
  insignia: string;
  logo: string;
  logoBackgroundColor: string;
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

const guildLogos = {
  logo1: '🛡️',
  logo2: '👑',
  logo3: '⭐',
  logo4: '⚔️',
  logo5: '🐲',
};

export default function Guild() {
  const [isCreateGuildOpen, setIsCreateGuildOpen] = useState(false);
  const { user } = useAuth();

  // Fetch public guilds
  const { data: publicGuilds, isLoading: loadingPublic } = useQuery({
    queryKey: ['/api/guilds'],
    enabled: true,
  });

  // Fetch user's guilds if authenticated
  const { data: userGuilds, isLoading: loadingUser } = useQuery({
    queryKey: ['/api/guilds/my'],
    enabled: !!user,
  });

  const renderGuildCard = (guild: Guild, showMembershipStatus = false) => (
    <Card key={guild.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: guild.logoBackgroundColor }}
            >
              {guildLogos[guild.logo as keyof typeof guildLogos] || '🛡️'}
            </div>
            <div>
              <CardTitle className="text-lg">{guild.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {guild.insignia}
                </Badge>
                {guild.isPrivate ? (
                  <Lock className="w-3 h-3 text-red-500" />
                ) : (
                  <Globe className="w-3 h-3 text-green-500" />
                )}
                {showMembershipStatus && (
                  <Badge variant="outline" className="text-xs">
                    Member
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {guild.memberCount}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {guild.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created by {guild.ownerName}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {guild.postCount} posts
            </Badge>
            <Badge 
              variant={guild.isPrivate ? "destructive" : "secondary"} 
              className="text-xs"
            >
              {guild.isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        {/* Header with Back and Create Guild Button */}
        <div className="flex items-center justify-between p-6">
          <SecureLink href="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </SecureLink>

          <Button 
            onClick={() => setIsCreateGuildOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Guild
          </Button>
        </div>

        {/* Guild Content Area */}
        <div className="flex-1 px-6 pb-6">
          {/* My Guilds Section */}
          {user && userGuilds && userGuilds.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                My Guilds
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGuilds.map((guild: Guild) => renderGuildCard(guild, true))}
              </div>
            </div>
          )}

          {/* Public Guilds Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Public Guilds
            </h2>

            {loadingPublic || loadingUser ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : publicGuilds && publicGuilds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicGuilds.map((guild: Guild) => renderGuildCard(guild))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  No public guilds yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                  Be the first to create a guild and build your community
                </p>
                <Button 
                  onClick={() => setIsCreateGuildOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create First Guild
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Guild Modal */}
        <CreateGuildModal 
          isOpen={isCreateGuildOpen}
          onClose={() => setIsCreateGuildOpen(false)}
        />
      </div>
    </Layout>
  );
}