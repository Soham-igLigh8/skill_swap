import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import StatsCards from "@/components/stats-cards";
import SkillCard from "@/components/skill-card";
import ProfileSidebar from "@/components/profile-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: usersWithSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/users/with-skills"],
    retry: false,
  });

  const { data: swapRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/swap-requests/user"],
    retry: false,
  });

  const { data: adminMessages } = useQuery({
    queryKey: ["/api/admin/messages"],
    retry: false,
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

  const filteredUsers = usersWithSkills?.filter((userWithSkills: any) => {
    if (!searchQuery && !selectedCategory) return true;
    
    const matchesSearch = !searchQuery || 
      userWithSkills.skills.some((skill: any) => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = !selectedCategory ||
      userWithSkills.skills.some((skill: any) => skill.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  }) || [];

  const activeSwaps = swapRequests?.filter((req: any) => req.request.status === 'accepted').length || 0;
  const pendingRequests = swapRequests?.filter((req: any) => req.request.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Messages */}
        {adminMessages && adminMessages.length > 0 && (
          <div className="mb-6">
            {adminMessages.map((message: any) => (
              <div key={message.id} className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2">
                <div className="flex items-center">
                  <i className="fas fa-bullhorn text-blue-600 dark:text-blue-400 mr-3"></i>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">{message.title}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {user.firstName || user.email}!
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Discover new skills and share your expertise
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button className="flex items-center">
                <i className="fas fa-plus mr-2"></i>
                Add Skill
              </Button>
              <Button variant="secondary" className="flex items-center">
                <i className="fas fa-search mr-2"></i>
                Find Skills
              </Button>
            </div>
          </div>
        </div>

        <StatsCards 
          activeSwaps={activeSwaps}
          pendingRequests={pendingRequests}
          rating={user.rating || 0}
          connections={0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Find Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <Input
                      placeholder="Search skills (e.g., 'Photoshop', 'Excel', 'Guitar')"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Language">Language</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Creative">Creative</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Search</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Skills Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Available Skills</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-th-large"></i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-list"></i>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {skillsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
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
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredUsers.map((userWithSkills: any) => 
                      userWithSkills.skills
                        .filter((skill: any) => skill.type === 'offered' && skill.isActive)
                        .map((skill: any) => (
                          <SkillCard 
                            key={skill.id} 
                            skill={skill} 
                            user={userWithSkills}
                          />
                        ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileSidebar user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
