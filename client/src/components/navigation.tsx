import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const { user } = useAuth();
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
    { name: "Dashboard", href: "/", icon: "fas fa-home" },
    { name: "Browse Skills", href: "/browse", icon: "fas fa-search" },
    { name: "My Requests", href: "/requests", icon: "fas fa-exchange-alt" },
    { name: "Profile", href: "/profile", icon: "fas fa-user" },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: "Admin", href: "/admin", icon: "fas fa-cog" });
  }

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-exchange-alt text-primary text-2xl mr-3"></i>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SkillSwap</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={`${
                      location === item.href
                        ? "text-primary font-medium"
                        : "text-slate-600 dark:text-slate-300 hover:text-primary"
                    } px-3 py-2 rounded-md text-sm transition-colors flex items-center`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.name}
                    {item.name === "My Requests" && pendingCount > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => navigate("/requests")}
                className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                <i className="fas fa-bell text-lg"></i>
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
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
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/requests")}>
                  <i className="fas fa-exchange-alt mr-2"></i>
                  My Requests
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <i className="fas fa-cog mr-2"></i>
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-primary transition-colors md:hidden">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
