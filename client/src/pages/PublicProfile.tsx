import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Calendar, Star, Award, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MembershipBadges } from '@/components/MembershipBadges';
import { IQBadge } from '@/components/IQBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { SecureLink } from '@/components/SecureRouter';

interface PublicUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  aliasName?: string;
  profileImageUrl?: string;
  description?: string;
  fame: number;
  iqScore?: number;
  iqTestTaken: boolean;
  isTopaz: boolean;
  isAgate: boolean;
  isAqua: boolean;
  // Staff badges
  isModerator?: boolean;
  isStaff?: boolean;
  isDeveloper?: boolean;
  // Database badges
  hasBasicDB?: boolean;
  hasInterDB?: boolean;
  hasProDB?: boolean;
  createdAt: string;
}

export default function PublicProfile({ userId }: { userId?: string }) {
  const params = useParams<{ userId: string }>();
  const finalUserId = userId || params.userId;
  const { t } = useLanguage();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [`/api/user/public/${finalUserId}`],
    enabled: !!finalUserId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
            <SecureLink href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Back to Home
              </button>
            </SecureLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || 'Anonymous User';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <SecureLink href="/">
          <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </SecureLink>
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={user.profileImageUrl} 
                alt={displayName}
              />
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <MembershipBadges 
                  isTopaz={user.isTopaz}
                  isAgate={user.isAgate}
                  isAqua={user.isAqua}
                  isModerator={user.isModerator}
                  isStaff={user.isStaff}
                  isDeveloper={user.isDeveloper}
                  hasBasicDB={user.hasBasicDB}
                  hasInterDB={user.hasInterDB}
                  hasProDB={user.hasProDB}
                  transparentBackground={true}
                />
              </div>
              
              {user.aliasName && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    @{user.aliasName}
                  </span>
                  <MembershipBadges 
                    isTopaz={user.isTopaz}
                    isAgate={user.isAgate}
                    isAqua={user.isAqua}
                    isModerator={user.isModerator}
                    isStaff={user.isStaff}
                    isDeveloper={user.isDeveloper}
                    hasBasicDB={user.hasBasicDB}
                    hasInterDB={user.hasInterDB}
                    hasProDB={user.hasProDB}
                    transparentBackground={true}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{user.fame || 0}</span>
                  <span className="text-gray-600 dark:text-gray-400">Honor</span>
                </div>
                
                {user.iqTestTaken && user.iqScore && (
                  <IQBadge score={user.iqScore} />
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {user.description && (
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{user.description}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Honor Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.fame || 0}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Total honor points earned
            </p>
          </CardContent>
        </Card>

        {user.iqTestTaken && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-500" />
                <span>Intelligence Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.iqScore}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                IQ test completed
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Badge className="w-5 h-5 text-purple-500" />
              <span>Membership</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {user.isAqua ? (
                <Badge variant="default" className="bg-cyan-600">Aqua</Badge>
              ) : user.isAgate ? (
                <Badge variant="default" className="bg-gray-600">Agate</Badge>
              ) : user.isTopaz ? (
                <Badge variant="default" className="bg-orange-600">Topaz</Badge>
              ) : (
                <Badge variant="outline">Free</Badge>
              )}
              <MembershipBadges 
                isTopaz={user.isTopaz}
                isAgate={user.isAgate}
                isAqua={user.isAqua}
                isModerator={user.isModerator}
                isStaff={user.isStaff}
                isDeveloper={user.isDeveloper}
                hasBasicDB={user.hasBasicDB}
                hasInterDB={user.hasInterDB}
                hasProDB={user.hasProDB}
                transparentBackground={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
              <Award className="w-6 h-6" />
              <span className="text-lg">Coming Soon</span>
            </div>
            <p className="text-sm text-gray-400">Achievements system is currently in development</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}