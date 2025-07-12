import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  activeSwaps: number;
  pendingRequests: number;
  rating: number;
  connections: number;
}

export default function StatsCards({ activeSwaps, pendingRequests, rating, connections }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-handshake text-primary text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Swaps</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeSwaps}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-clock text-secondary text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Pending Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-star text-accent text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Rating</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{rating.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-primary text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Connections</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{connections}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
