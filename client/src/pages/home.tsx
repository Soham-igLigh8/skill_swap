import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import StatsCards from "@/components/stats-cards";
import { useAuth } from "@/hooks/use-auth";
import { Plus, TrendingUp, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Ready to exchange skills and expand your knowledge?
              </p>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="futuristic-card border-primary/20 hover:border-primary/50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          activeSwaps={0}
          pendingRequests={0}
          rating={user.rating || 0}
          connections={0}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className="futuristic-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                Add New Skill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Share your expertise with the community
              </p>
              <Button className="w-full mt-4 futuristic-button">
                Create Skill
              </Button>
            </CardContent>
          </Card>

          <Card className="futuristic-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                Browse Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discover new skills to learn
              </p>
              <Button variant="outline" className="w-full mt-4 border-accent/30 hover:border-accent/60">
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="futuristic-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-secondary" />
                Connect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Network with skilled professionals
              </p>
              <Button variant="outline" className="w-full mt-4 border-secondary/30 hover:border-secondary/60">
                Find People
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
            Recent Activity
          </h2>
          <Card className="futuristic-card">
            <CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 mx-auto text-primary/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your skill exchange journey by adding your first skill or browsing available skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="futuristic-button">
                  Add Your First Skill
                </Button>
                <Button variant="outline" className="border-primary/30 hover:border-primary/60">
                  Browse Skills
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}