import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface IQBadgeProps {
  score: number;
  className?: string;
  showIcon?: boolean;
}

export function IQBadge({ score, className = '', showIcon = true }: IQBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 140) return 'bg-purple-600 text-white';
    if (score >= 130) return 'bg-blue-600 text-white';
    if (score >= 120) return 'bg-green-600 text-white';
    if (score >= 110) return 'bg-yellow-600 text-white';
    if (score >= 90) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 140) return 'Genius';
    if (score >= 130) return 'Highly Gifted';
    if (score >= 120) return 'Superior';
    if (score >= 110) return 'Above Average';
    if (score >= 90) return 'Average';
    return 'Below Average';
  };

  return (
    <Badge 
      variant="secondary" 
      className={`inline-flex items-center space-x-1 ${getScoreColor(score)} ${className}`}
    >
      {showIcon && <Brain className="h-3 w-3" />}
      <span>IQ {score}</span>
      <span className="text-xs opacity-90">({getScoreLabel(score)})</span>
    </Badge>
  );
}