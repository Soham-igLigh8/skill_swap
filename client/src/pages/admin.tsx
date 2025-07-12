import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

const messageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.string().min(1, "Type is required"),
});

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: adminMessages } = useQuery({
    queryKey: ["/api/admin/messages"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "announcement",
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof messageSchema>) => {
      await apiRequest("POST", "/api/admin/messages", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      messageForm.reset();
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
        description: "Failed to create message",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/ban/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User banned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/unban/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User unbanned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Failed to unban user",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin access",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  const onMessageSubmit = (data: z.infer<typeof messageSchema>) => {
    createMessageMutation.mutate(data);
  };

  const activeUsers = users?.filter((u: any) => !u.isBanned).length || 0;
  const bannedUsers = users?.filter((u: any) => u.isBanned).length || 0;
  const pendingReports = reports?.filter((r: any) => r.report.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Platform management and moderation tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-users text-primary text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-ban text-red-500 text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Banned Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{bannedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-flag text-yellow-500 text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending Reports</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-bullhorn text-blue-500 text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Messages</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{adminMessages?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Loading users...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                                <AvatarFallback>
                                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{user.location}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 text-xs mr-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i key={i} className={`fas fa-star ${i < Math.floor(user.rating || 0) ? '' : 'text-gray-300'}`}></i>
                                ))}
                              </div>
                              <span className="text-sm">{user.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isBanned ? "destructive" : "secondary"}>
                              {user.isBanned ? "Banned" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isBanned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unbanUserMutation.mutate(user.id)}
                                disabled={unbanUserMutation.isPending}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => banUserMutation.mutate(user.id)}
                                disabled={banUserMutation.isPending}
                              >
                                Ban
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports Management</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Loading reports...</p>
                  </div>
                ) : reports?.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shield-alt text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Reports</h3>
                    <p className="text-slate-600 dark:text-slate-300">All clear! No reports to review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports?.map((report: any) => (
                      <div key={report.report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={report.reporter.profileImageUrl} alt={report.reporter.firstName} />
                              <AvatarFallback>
                                {report.reporter.firstName?.[0] || report.reporter.email?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium">
                                {report.reporter.firstName} {report.reporter.lastName}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {new Date(report.report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={report.report.status === 'pending' ? 'destructive' : 'secondary'}>
                            {report.report.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Reason: {report.report.reason}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {report.report.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Platform Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={messageForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Message title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={messageForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="announcement">Announcement</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="feature_update">Feature Update</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Message content" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={createMessageMutation.isPending}>
                        {createMessageMutation.isPending ? "Creating..." : "Create Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  {adminMessages?.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-bullhorn text-4xl text-slate-400 mb-4"></i>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Active Messages</h3>
                      <p className="text-slate-600 dark:text-slate-300">Create your first platform message above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {adminMessages?.map((message: any) => (
                        <div key={message.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{message.title}</h4>
                            <Badge variant="secondary">{message.type}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <i className="fas fa-chart-bar text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Detailed analytics and reporting features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
