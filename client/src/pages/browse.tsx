import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import SkillCard from "@/components/skill-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Browse() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const { data: usersWithSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/users/with-skills"],
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
    // Don't show own profile
    if (userWithSkills.id === user.id) return false;
    
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

  const allSkills = filteredUsers.flatMap((user: any) => 
    user.skills
      .filter((skill: any) => skill.type === 'offered' && skill.isActive)
      .map((skill: any) => ({ skill, user }))
  );

  const categories = [...new Set(
    usersWithSkills?.flatMap((user: any) => 
      user.skills.map((skill: any) => skill.category)
    ) || []
  )].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Browse Skills</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Discover amazing skills from our community
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find the Perfect Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <Input
                  placeholder="Search skills, people, or keywords..."
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
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <i className="fas fa-th-large"></i>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <i className="fas fa-list"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === "" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("")}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {allSkills.length} Skills Found
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <i className="fas fa-sort"></i>
                <span>Sorted by rating</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {skillsLoading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : allSkills.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No skills found
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {allSkills.map(({ skill, user }) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    user={user}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
