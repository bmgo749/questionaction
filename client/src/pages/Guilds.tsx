import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Lock, Globe, Plus, Mail, UserPlus, Settings, Crown, Shield, Hash, Eye, UserMinus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SecureLink } from "@/components/SecureRouter";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { CreateGuildModal } from "@/components/CreateGuildModal";

interface Guild {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
  insignia: string;
  logo: string;
  logoBackgroundColor: string;
  memberCount: number;
  postCount: number;
  isMember: boolean;
  canJoin: boolean;
  createdAt: string;
}

export default function Guilds() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGuildForInvite, setSelectedGuildForInvite] = useState<number | null>(null);

  // Fetch guilds
  const { data: guilds, isLoading } = useQuery({
    queryKey: ["/api/guilds"],
    enabled: isAuthenticated,
  });

  // Get user's current guild
  const { data: currentGuild } = useQuery({
    queryKey: ['/api/user/current-guild'],
    enabled: isAuthenticated,
  });

  // Get user's guilds
  const { data: userGuilds = [] } = useQuery({
    queryKey: ['/api/guilds/my'],
    enabled: isAuthenticated,
  });

  // Check if user can create guild
  const { data: canCreateGuildData } = useQuery({
    queryKey: ['/api/user/can-create-guild'],
    enabled: isAuthenticated,
  });



  // Join guild mutation
  const joinGuildMutation = useMutation({
    mutationFn: async (guildId: number) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined guild!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guilds"] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/current-guild'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request to join private guild mutation
  const requestJoinMutation = useMutation({
    mutationFn: async (guildId: number) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/request`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Join request sent successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send invite mutation
  const sendInviteMutation = useMutation({
    mutationFn: async ({ guildId, email }: { guildId: number; email: string }) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/invite`, { email });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invite sent successfully!",
      });
      setInviteEmail("");
      setSelectedGuildForInvite(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enter guild mutation with proper navigation
  const enterGuildMutation = useMutation({
    mutationFn: async (guildId: number) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/enter`, {});
    },
    onSuccess: (data, guildId) => {
      toast({
        title: "Success",
        description: "Entered guild successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/current-guild'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guilds/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guilds'] });
      
      // Use secure navigation
      import('@/lib/security').then(({ transformToSecurePath }) => {
        const secureUrl = transformToSecurePath(`/guild/${guildId}`);
        window.location.href = secureUrl;
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave guild mutation
  const leaveGuildMutation = useMutation({
    mutationFn: async (guildId: number) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/leave`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Left guild successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guilds"] });
      queryClient.invalidateQueries({ queryKey: ['/api/guilds/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/current-guild'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/can-create-guild'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  const handleJoinGuild = (guild: Guild) => {
    if (guild.isPrivate) {
      requestJoinMutation.mutate(guild.id);
    } else {
      joinGuildMutation.mutate(guild.id);
    }
  };

  const handleSendInvite = (guildId: number) => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    sendInviteMutation.mutate({ guildId, email: inviteEmail });
  };

  const getRoleIcon = (guild: Guild) => {
    if (guild.ownerId === user?.id) return <Crown className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be logged in to access guilds.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => {
                const code = Math.random().toString(36).substring(2, 15);
                const errorCode = Math.random().toString(36).substring(2, 8);
                window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#auth`;
              }}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading guilds...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Guilds</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Join communities, share content, and collaborate with others
            </p>
            {userGuilds.length > 0 && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                You're a member of {userGuilds.length} guild(s). {canCreateGuildData?.canCreate ? "You can still create your own guild anytime!" : "Leave your current guild to create a new one."}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Enter Your Guild Button with Exit Option */}
            {userGuilds.length > 0 && (
              <div className="flex items-center gap-2">
                <Select onValueChange={(value) => enterGuildMutation.mutate(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Enter Your Guild" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGuilds.map((guild: any) => (
                      <SelectItem key={guild.id} value={guild.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span>{guild.name}</span>
                          <span className="text-sm text-gray-500">({guild.memberCount} members)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                

              </div>
            )}
            
            {/* Create Guild Button */}
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              disabled={canCreateGuildData && !canCreateGuildData.canCreate}
              title={canCreateGuildData && !canCreateGuildData.canCreate ? "You must leave your current guild before creating a new one" : ""}
            >
              <Plus className="h-4 w-4" />
              {canCreateGuildData && !canCreateGuildData.canCreate ? "Already Guild Member" : "Create New Guild"}
            </Button>
            
            <CreateGuildModal 
              isOpen={isCreateDialogOpen} 
              onClose={() => setIsCreateDialogOpen(false)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds?.map((guild: Guild) => (
            <Card key={guild.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{guild.name}</CardTitle>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                          {guild.insignia}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {guild.isPrivate ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Public
                          </Badge>
                        )}
                        {getRoleIcon(guild)}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {guild.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {guild.memberCount} {guild.memberCount === 1 ? 'member' : 'members'}
                  </div>
                  <div>Owner: {guild.ownerName}</div>
                </div>
                
                <div className="flex gap-2">
                  {guild.isMember ? (
                    <>
                      {currentGuild?.guildId === guild.id ? (
                        <Badge variant="secondary" className="flex-1 justify-center py-2">
                          <Shield className="h-4 w-4 mr-2" />
                          Current Guild
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => apiRequest('POST', `/api/guilds/${guild.id}/enter`).then(() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/user/current-guild'] });
                            toast({ title: "Success", description: `Entered ${guild.name}!` });
                          })}
                          variant="outline" 
                          className="flex-1"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Enter Guild
                        </Button>
                      )}
                      
                      {/* Owner: Show invite button */}
                      {(guild.ownerId === user?.id) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedGuildForInvite(guild.id)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invite Member</DialogTitle>
                              <DialogDescription>
                                Send an email invitation to join {guild.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="invite-email">Email Address</Label>
                                <Input
                                  id="invite-email"
                                  type="email"
                                  placeholder="Enter email address"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                  setInviteEmail("");
                                  setSelectedGuildForInvite(null);
                                }}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => handleSendInvite(guild.id)}
                                  disabled={sendInviteMutation.isPending}
                                >
                                  {sendInviteMutation.isPending ? "Sending..." : "Send Invite"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {/* Non-owner members: Show leave button */}
                      {guild.isMember && guild.ownerId !== user?.id && (
                        <Button 
                          onClick={() => leaveGuildMutation.mutate(guild.id)}
                          disabled={leaveGuildMutation.isPending}
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : userGuilds.some((userGuild: any) => userGuild.id === guild.id) ? (
                    <SecureLink href={`/guild/${guild.id}`}>
                      <Button 
                        variant="default" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </SecureLink>
                  ) : (
                    <Button 
                      onClick={() => handleJoinGuild(guild)}
                      disabled={joinGuildMutation.isPending || requestJoinMutation.isPending}
                      className="flex-1"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {guild.isPrivate ? "Request to Join" : "Join Guild"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!guilds || guilds.length === 0) && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No guilds found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Be the first to create a guild and start building a community!
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Guild
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}