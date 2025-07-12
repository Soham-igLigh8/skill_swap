import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RequestModal from "./request-modal";
import { useState } from "react";

interface SkillCardProps {
  skill: any;
  user: any;
  viewMode?: 'grid' | 'list';
}

export default function SkillCard({ skill, user, viewMode = 'grid' }: SkillCardProps) {
  const { user: currentUser } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const getStatusColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'beginner': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Design': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Music': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Language': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Business': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Creative': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Sports': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Academic': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const isOwnSkill = currentUser?.id === user.id;

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow duration-200 ${viewMode === 'list' ? 'mb-4' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                <AvatarFallback>
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {user.location || 'Location not specified'}
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
            <Badge className={getStatusColor(user.rating || 0)}>
              {user.rating >= 4.5 ? 'Expert' : user.rating >= 4.0 ? 'Skilled' : 'Available'}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{skill.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {skill.description || 'No description provided'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge className={getCategoryColor(skill.category)}>
                {skill.category}
              </Badge>
              <Badge className={getLevelColor(skill.level)}>
                {skill.level}
              </Badge>
              {skill.tags?.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <i className="fas fa-clock mr-1"></i>
                <span>Flexible schedule</span>
              </div>
              {!isOwnSkill && (
                <Button
                  size="sm"
                  onClick={() => setShowRequestModal(true)}
                  className="text-sm"
                >
                  Request Swap
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        skill={skill}
        provider={user}
      />
    </>
  );
}
