import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap, Users, Star, ArrowRight, Sparkles, Globe, Target, Search, Handshake } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="futuristic-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center glow-effect">
              <div className="futuristic-button p-2 mr-3">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SkillSwap
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 glow-effect">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-primary">The Future of Skill Exchange</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Exchange Skills,
                </span>
                <span className="block bg-gradient-to-r from-accent via-primary to-foreground bg-clip-text text-transparent">
                  Build Future
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect with skilled professionals in our next-generation platform. Share your expertise, 
                learn cutting-edge skills, and build the future together.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="futuristic-button px-8 py-4 text-lg font-semibold group"
                >
                  Begin Your Evolution
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold futuristic-card border-primary/20 hover:border-primary/50"
                >
                  Explore Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 backdrop-blur-sm" style={{ backgroundColor: 'hsl(var(--card) / 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 glow-effect">
              <Target className="h-4 w-4 mr-2 text-accent" />
              <span className="text-sm font-medium text-accent">Advanced Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Next-Gen Skill Exchange
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by intelligent matching algorithms and community-driven innovation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="futuristic-card hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 glow-effect">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-lg bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      AI-Powered Discovery
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced algorithms match you with the perfect skills and mentors across the globe.
                </p>
              </CardContent>
            </Card>

            <Card className="futuristic-card hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 glow-effect">
                    <Handshake className="h-6 w-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-lg bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                      Smart Exchanges
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent matching system ensures fair and mutually beneficial skill exchanges.
                </p>
              </CardContent>
            </Card>

            <Card className="futuristic-card hover:scale-105 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 glow-effect">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-lg bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      Trust Network
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Blockchain-inspired reputation system builds lasting trust in the community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Popular Skills Section */}
      <div className="py-20 bg-background cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 glow-effect">
              <Globe className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-primary">Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              Future Skills Marketplace
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands learning tomorrow's most valuable skills today
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { skill: "AI & Machine Learning", hot: true },
              { skill: "Blockchain Development", hot: true },
              { skill: "UX/UI Design", hot: false },
              { skill: "Data Science", hot: true },
              { skill: "DevOps", hot: false },
              { skill: "Digital Marketing", hot: false },
              { skill: "React/Next.js", hot: true },
              { skill: "Photography", hot: false },
              { skill: "Content Creation", hot: false },
              { skill: "Product Management", hot: true },
              { skill: "Cybersecurity", hot: true },
              { skill: "Cloud Computing", hot: false }
            ].map(({ skill, hot }) => (
              <Badge 
                key={skill} 
                className={`text-sm px-6 py-3 transition-all hover:scale-105 ${
                  hot 
                    ? "futuristic-button border-accent/50 glow-effect" 
                    : "futuristic-card border-primary/20"
                }`}
              >
                {skill}
                {hot && <Sparkles className="ml-2 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary"></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, hsl(var(--background) / 0.1), transparent)' }}></div>
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8 relative">
          <div className="glow-effect">
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              <span className="block bg-gradient-to-r from-white to-primary-foreground bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <span className="block bg-gradient-to-r from-primary-foreground to-white bg-clip-text text-transparent">
                Your Future?
              </span>
            </h2>
          </div>
          <p className="mt-6 text-xl leading-8 max-w-2xl mx-auto" style={{ color: 'hsl(0 0% 100% / 0.9)' }}>
            Join thousands of innovators building tomorrow's skills today. Your journey into the future starts here.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="px-8 py-4 bg-white text-primary hover:bg-white hover:opacity-90 text-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Begin Your Evolution
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              className="px-8 py-4 text-white text-lg font-semibold border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
            >
              Explore the Platform
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center glow-effect mb-4">
              <div className="futuristic-button p-2 mr-3">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SkillSwap
              </span>
            </div>
            <p className="text-muted-foreground">
              Building the future of skill exchange, one connection at a time.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              © 2025 SkillSwap. Powered by innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
