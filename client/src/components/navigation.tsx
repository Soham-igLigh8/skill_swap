import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap, Search, RefreshCw, User, Settings, Bell, LogOut } from "lucide-react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  const { data: swapRequests } = useQuery({
    queryKey: ["/api/swap-requests/user"],
    enabled: !!user,
    retry: false,
  });

  const pendingCount = swapRequests?.filter((req: any) => 
    req.request.status === 'pending' && req.provider?.id === user?.id
  ).length || 0;

  const navItems = [
    { name: "Dashboard", href: "/home", icon: Zap },
    { name: "Browse Skills", href: "/browse", icon: Search },
    { name: "My Requests", href: "/requests", icon: RefreshCw },
    { name: "Profile", href: "/profile", icon: User },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: "Admin", href: "/admin", icon: Settings });
  }

  return (
    <nav className="futuristic-nav sticky top-0 z-50 cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center glow-effect">
              <div className="futuristic-button p-2 mr-3">
                <RefreshCw className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SkillSwap
              </span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={`${
                        location === item.href
                          ? "text-primary font-medium bg-primary/10 border border-primary/20"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      } px-4 py-2 rounded-lg text-sm transition-all flex items-center futuristic-card`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {item.name}
                      {item.name === "My Requests" && pendingCount > 0 && (
                        <Badge className="ml-2 text-xs futuristic-button">
                          {pendingCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/requests")}
                className="futuristic-button border-primary/20 hover:border-primary/50"
              >
                <Bell className="h-4 w-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center glow-effect">
                    {pendingCount}
                  </span>
                )}
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 futuristic-card" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/requests")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  My Requests
                  {pendingCount > 0 && (
                    <Badge className="ml-auto text-xs futuristic-button">
                      {pendingCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="icon"
              className="md:hidden futuristic-button border-primary/20 hover:border-primary/50"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
