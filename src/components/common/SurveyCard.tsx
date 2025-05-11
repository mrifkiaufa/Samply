
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export interface Survey {
  id: string;
  title: string;
  description: string;
  researcherName: string;
  institution: string;
  createdAt: string;
  topics: string[];
  respondentCount: number;
  targetRespondents: number;
  status: 'open' | 'closed';
  formLink: string;
  points?: number; // Added points property
  deadline?: string; // Added deadline property
  closedAt?: string; // Added closedAt property
}

interface SurveyCardProps {
  survey: Survey;
  viewType: 'respondent' | 'researcher';
  hideParticipateButton?: boolean;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, viewType, hideParticipateButton }) => {
  const progress = Math.min(Math.round((survey.respondentCount / survey.targetRespondents) * 100), 100);
  const statusColor = survey.status === 'open' ? 'bg-green-500' : 'bg-gray-400';
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="font-bold text-xl mb-1 font-heading">{survey.title}</CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              {survey.institution} • Posted {timeAgo(survey.createdAt)}
            </CardDescription>
          </div>
          <div>
            <span className={`inline-flex w-3 h-3 rounded-full ${statusColor}`}></span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-1 flex-1">
        <p className="text-gray-700 mb-4">{survey.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {survey.topics.map(topic => (
            <Badge key={topic} variant="secondary">{topic}</Badge>
          ))}
        </div>
        
        <div className="mt-6 mb-1">
          <div className="flex justify-between text-sm mb-1">
            <span>{survey.respondentCount} responses</span>
            <span>{survey.targetRespondents} target</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By {survey.researcherName}
        </div>
        
        {viewType === 'respondent' && survey.status === 'open' && !hideParticipateButton && (
          <Link to={`/survey/${survey.id}`}>
            <Button size="sm">Participate</Button>
          </Link>
        )}
        
        {viewType === 'researcher' && (
          <Link to={`/researcher-dashboard/surveys/${survey.id}/responses`}>
            <Button variant="outline" size="sm">View Responses</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

// Helper function to format dates
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};

export default SurveyCard;