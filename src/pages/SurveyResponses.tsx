
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { Survey } from '../components/common/SurveyCard';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface SurveySubmission {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SurveyResponses = () => {
  const { id } = useParams<{ id: string }>();
  const { user, updateUserPoints } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in or not a researcher
    if (!user) {
      navigate('/login');
      return;
    } else if (user.role !== 'researcher') {
      navigate('/researcher-dashboard');
      return;
    }

    // Load survey data
    const loadSurveyData = async () => {
      try {
        setLoading(true);
        
        // Fetch survey details
        const surveysStr = localStorage.getItem('samplySurveys');
        if (!surveysStr) {
          toast({
            title: "Error",
            description: "No surveys found",
            variant: "destructive",
          });
          navigate('/researcher-dashboard');
          return;
        }
        
        const surveys: Survey[] = JSON.parse(surveysStr);
        const foundSurvey = surveys.find(s => s.id === id);
        
        if (!foundSurvey) {
          toast({
            title: "Error",
            description: "Survey not found",
            variant: "destructive",
          });
          navigate('/researcher-dashboard');
          return;
        }
        
        // Check if this researcher owns this survey
        if (foundSurvey.researcherName !== user.name) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view responses for this survey",
            variant: "destructive",
          });
          navigate('/researcher-dashboard');
          return;
        }
        
        setSurvey(foundSurvey);
        
        // Fetch submissions
        const submissionsStr = localStorage.getItem('surveySubmissions');
        if (submissionsStr) {
          const allSubmissions = JSON.parse(submissionsStr);
          const surveySubmissions = allSubmissions.filter(
            (sub: SurveySubmission) => sub.surveyId === id
          );
          setSubmissions(surveySubmissions);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error("Error loading survey data:", error);
        toast({
          title: "Error",
          description: "Failed to load survey data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSurveyData();
  }, [id, navigate, user]);

  // Handle approve submission
  const handleApprove = async (submissionId: string, userId: string) => {
    try {
      if (!survey) return;
      
      // Update submission status
      const submissionsStr = localStorage.getItem('surveySubmissions');
      if (!submissionsStr) return;
      
      const allSubmissions = JSON.parse(submissionsStr);
      const updatedSubmissions = allSubmissions.map((sub: SurveySubmission) => {
        if (sub.id === submissionId) {
          return { ...sub, status: 'approved' };
        }
        return sub;
      });
      
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));
      
      // Update local state
      setSubmissions(prevSubs => 
        prevSubs.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'approved' } 
            : sub
        )
      );
      
      // Increment survey respondent count
      const surveysStr = localStorage.getItem('samplySurveys');
      if (!surveysStr) return;
      
      const surveys: Survey[] = JSON.parse(surveysStr);
      const updatedSurveys = surveys.map(s => {
        if (s.id === id && s.status === 'open') {
          return { 
            ...s, 
            respondentCount: s.respondentCount + 1 
          };
        }
        return s;
      });
      
      localStorage.setItem('samplySurveys', JSON.stringify(updatedSurveys));
      
      // Update local survey state
      if (survey) {
        setSurvey({
          ...survey,
          respondentCount: survey.respondentCount + 1
        });
      }
      
      // Award points to the respondent
      const usersStr = localStorage.getItem('samplyUsers');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const updatedUsers = users.map((u: any) => {
          if (u.id === userId) {
            return { 
              ...u, 
              points: (u.points || 0) + (survey.points || 10) 
            };
          }
          return u;
        });
        localStorage.setItem('samplyUsers', JSON.stringify(updatedUsers));
      }
      
      // If the current user is the respondent, update their points
      if (user && user.id === userId) {
        updateUserPoints((user.points || 0) + (survey.points || 10));
      }
      
      toast({
        title: "Response approved",
        description: `The response has been approved and ${survey.points || 10} points have been awarded to the respondent.`,
      });
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve response",
        variant: "destructive",
      });
    }
  };

  // Handle reject submission
  const handleReject = async (submissionId: string) => {
    try {
      // Update submission status
      const submissionsStr = localStorage.getItem('surveySubmissions');
      if (!submissionsStr) return;
      
      const allSubmissions = JSON.parse(submissionsStr);
      const updatedSubmissions = allSubmissions.map((sub: SurveySubmission) => {
        if (sub.id === submissionId) {
          return { ...sub, status: 'rejected' };
        }
        return sub;
      });
      
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));
      
      // Update local state
      setSubmissions(prevSubs => 
        prevSubs.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'rejected' } 
            : sub
        )
      );
      
      toast({
        title: "Response rejected",
        description: "The response has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject response",
        variant: "destructive",
      });
    }
  };

  if (loading || !survey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link 
            to="/researcher-dashboard" 
            className="text-primary hover:text-primary-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-2xl font-bold">{survey.title}</CardTitle>
                <CardDescription className="text-gray-500">
                  {survey.respondentCount} / {survey.targetRespondents} responses
                </CardDescription>
              </div>
              <Badge 
                variant={survey.status === 'open' ? 'default' : 'secondary'}
                className="mt-2 md:mt-0"
              >
                {survey.status === 'open' ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500 block">Points per response</span>
              <span className="font-medium">{survey.points || 10} points</span>
            </div>
            {survey.deadline && (
              <div>
                <span className="text-sm text-gray-500 block">Deadline</span>
                <span className="font-medium">{new Date(survey.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500 block">Created on</span>
              <span className="font-medium">{new Date(survey.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-6">Survey Responses</h2>

        {submissions.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="font-medium">{submission.userName}</div>
                      <div className="text-sm text-gray-500">{submission.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                      {new Date(submission.submittedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pending
                        </Badge>
                      )}
                      {submission.status === 'approved' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" /> Approved
                        </Badge>
                      )}
                      {submission.status === 'rejected' && (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" /> Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(submission.id, submission.userId)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(submission.id)}
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                      {submission.status !== 'pending' && (
                        <span className="text-sm text-gray-500">
                          No actions available
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No responses yet</h3>
            <p className="mt-1 text-gray-500">
              You'll see responses here once participants complete your survey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;