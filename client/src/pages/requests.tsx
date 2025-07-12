import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Requests() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: swapRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/swap-requests/user"],
    enabled: !!user,
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      await apiRequest("PUT", `/api/swap-requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("DELETE", `/api/swap-requests/${requestId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  const sentRequests = swapRequests?.filter((req: any) => req.requester.id === user.id) || [];
  const receivedRequests = swapRequests?.filter((req: any) => req.provider.id === user.id) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const RequestCard = ({ request, type }: { request: any, type: 'sent' | 'received' }) => {
    const otherUser = type === 'sent' ? request.provider : request.requester;
    
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser.profileImageUrl} alt={otherUser.firstName} />
                <AvatarFallback>
                  {otherUser.firstName?.[0] || otherUser.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {otherUser.location}
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(otherUser.rating || 0) ? '' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    ({otherUser.rating?.toFixed(1) || '0.0'})
                  </span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(request.request.status)}>
              {request.request.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">
                {type === 'sent' ? 'Requesting' : 'They want'}: {request.requestedSkill.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {request.requestedSkill.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">
                {type === 'sent' ? 'Offering' : 'In exchange for'}: {request.offeredSkill.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {request.offeredSkill.description}
              </p>
            </div>

            {request.request.message && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Message:</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {request.request.message}
                </p>
              </div>
            )}

            {request.request.preferredTimes && request.request.preferredTimes.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Preferred Times:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.request.preferredTimes.map((time: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(request.request.createdAt).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              {type === 'received' && request.request.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ 
                      requestId: request.request.id, 
                      status: 'accepted' 
                    })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ 
                      requestId: request.request.id, 
                      status: 'rejected' 
                    })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Reject
                  </Button>
                </>
              )}
              {type === 'sent' && request.request.status === 'pending' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteRequestMutation.mutate(request.request.id)}
                  disabled={deleteRequestMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              {request.request.status === 'accepted' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate({ 
                    requestId: request.request.id, 
                    status: 'completed' 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Requests</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Manage your skill swap requests
          </p>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Requests You've Received</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-6 animate-pulse">
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="ml-3 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : receivedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No requests received
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      When someone wants to swap skills with you, they'll appear here
                    </p>
                  </div>
                ) : (
                  <div>
                    {receivedRequests.map((request: any) => (
                      <RequestCard key={request.request.id} request={request} type="received" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Requests You've Sent</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-6 animate-pulse">
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="ml-3 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-paper-plane text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No requests sent
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      When you request a skill swap, it will appear here
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = '/browse'}>
                      Browse Skills
                    </Button>
                  </div>
                ) : (
                  <div>
                    {sentRequests.map((request: any) => (
                      <RequestCard key={request.request.id} request={request} type="sent" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
