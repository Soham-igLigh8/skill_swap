import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSidebarProps {
  user: any;
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  const [, navigate] = useLocation();

  const { data: userSkills } = useQuery({
    queryKey: ["/api/skills/user", user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: swapRequests } = useQuery({
    queryKey: ["/api/swap-requests/user"],
    enabled: !!user,
    retry: false,
  });

  const offeredSkills = userSkills?.filter((skill: any) => skill.type === 'offered') || [];
  const wantedSkills = userSkills?.filter((skill: any) => skill.type === 'wanted') || [];

  const recentActivity = [
    {
      type: 'completed',
      message: 'Swap completed successfully',
      time: '2 hours ago',
      icon: 'fas fa-check-circle',
      color: 'text-green-500'
    },
    {
      type: 'request',
      message: 'New swap request received',
      time: '1 day ago',
      icon: 'fas fa-inbox',
      color: 'text-blue-500'
    },
    {
      type: 'view',
      message: 'Profile viewed by 3 people',
      time: '3 days ago',
      icon: 'fas fa-eye',
      color: 'text-yellow-500'
    }
  ];

  const pendingRequests = swapRequests?.filter((req: any) => 
    req.request.status === 'pending' && req.provider?.id === user?.id
  ) || [];

  return (
    <div className="space-y-6">
      {/* My Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
              <AvatarFallback className="text-lg">
                {user.firstName?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {user.location || 'Location not set'}
              </p>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(user.rating || 0) ? '' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  ({user.rating?.toFixed(1) || '0.0'})
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">Skills I Offer</h4>
              <div className="flex flex-wrap gap-1">
                {offeredSkills.slice(0, 3).map((skill: any) => (
                  <Badge key={skill.id} variant="secondary" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {offeredSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{offeredSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">Skills I Want</h4>
              <div className="flex flex-wrap gap-1">
                {wantedSkills.slice(0, 3).map((skill: any) => (
                  <Badge key={skill.id} variant="outline" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {wantedSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{wantedSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm text-slate-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.slice(0, 2).map((request: any) => (
                <div key={request.request.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester.profileImageUrl} alt={request.requester.firstName} />
                        <AvatarFallback className="text-xs">
                          {request.requester.firstName?.[0] || request.requester.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.requester.firstName} {request.requester.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Wants: {request.requestedSkill.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(request.request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
              {pendingRequests.length > 2 && (
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => navigate('/requests')}
                >
                  View All ({pendingRequests.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/profile')}
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Skill
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/browse')}
            >
              <i className="fas fa-search mr-2"></i>
              Browse All Skills
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/requests')}
            >
              <i className="fas fa-calendar mr-2"></i>
              View My Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
