
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import SurveyCard, { Survey } from '../components/common/SurveyCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

const SurveyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Load survey from localStorage
    const loadSurvey = async () => {
      setLoading(true);
      try {
        const surveysStr = localStorage.getItem('samplySurveys');
        if (surveysStr) {
          const surveys: Survey[] = JSON.parse(surveysStr);
          const foundSurvey = surveys.find(s => s.id === id);
          if (foundSurvey) {
            setSurvey(foundSurvey);
            
            // Check if user has already submitted this survey
            const submissionsStr = localStorage.getItem('surveySubmissions');
            if (submissionsStr) {
              const submissions = JSON.parse(submissionsStr);
              const userSubmission = submissions.find(
                (s: any) => s.surveyId === id && s.userId === user.id
              );
              if (userSubmission) {
                setHasSubmitted(true);
                setSubmissionStatus(userSubmission.status || 'pending');
              }
            }
          } else {
            toast({
              title: "Survey not found",
              description: "The survey you're looking for doesn't exist",
              variant: "destructive",
            });
            navigate(user.role === 'respondent' ? '/respondent-dashboard' : '/researcher-dashboard');
          }
        } else {
          toast({
            title: "Survey not found",
            description: "No surveys available",
            variant: "destructive",
          });
          navigate(user.role === 'respondent' ? '/respondent-dashboard' : '/researcher-dashboard');
        }
      } catch (error) {
        console.error('Error loading survey:', error);
        toast({
          title: "Error",
          description: "Failed to load survey details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSurvey();
  }, [id, navigate, user]);
  
  const handleConfirmCompletion = () => {
    // Store submission in localStorage
    const submissionsStr = localStorage.getItem('surveySubmissions');
    const submissions = submissionsStr ? JSON.parse(submissionsStr) : [];
    
    const newSubmission = {
      id: `submission_${Date.now()}`,
      surveyId: id,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
    };
    
    submissions.push(newSubmission);
    localStorage.setItem('surveySubmissions', JSON.stringify(submissions));
    
    // Close dialog and set submitted state
    setIsCompletionDialogOpen(false);
    setHasSubmitted(true);
    
    toast({
      title: "Submission recorded",
      description: "The researcher will review your submission soon",
    });
  };

  const goToGoogleForm = () => {
    if (survey?.formLink) {
      window.open(survey.formLink, '_blank');
    } else {
      toast({
        title: "Error",
        description: "This survey doesn't have a valid form link",
        variant: "destructive",
      });
    }
  };
  
  if (loading || !survey || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-12"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-6">
          <Link 
            to={user.role === 'respondent' ? '/respondent-dashboard' : '/researcher-dashboard'}
            className="text-primary hover:text-primary-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SurveyCard 
              survey={survey} 
              viewType={user.role as 'respondent' | 'researcher'}
              hideParticipateButton={true}
            />
            
            {user.role === 'respondent' && survey.status === 'open' && (
              <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                {!hasSubmitted ? (
                  <>
                    <h3 className="text-lg font-bold mb-4">Complete This Survey</h3>
                    <p className="text-gray-700 mb-6">
                      This survey is conducted through a Google Form. Click the button below to access the form.
                      After completing the survey, please return here and confirm your submission.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                      <Button onClick={goToGoogleForm} className="flex items-center">
                        <ExternalLink className="mr-2" size={16} />
                        Open Google Form
                      </Button>
                      <Button onClick={() => setIsCompletionDialogOpen(true)} variant="outline">
                        Confirm Completion
                      </Button>
                    </div>
                    
                    <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Survey Completion</DialogTitle>
                          <DialogDescription>
                            Please confirm that you've completed the survey through the Google Form link.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-gray-700 mb-4">
                            Are you sure you've completed the survey through the Google Form link? 
                            The researcher will verify your submission before approving points.
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            By confirming, you acknowledge:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                            <li>You have fully completed the survey</li>
                            <li>You've provided honest and thoughtful responses</li>
                            <li>You understand that false submissions may result in account penalties</li>
                          </ul>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCompletionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleConfirmCompletion}>
                            Confirm Submission
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    {submissionStatus === 'pending' && (
                      <>
                        <div className="rounded-full bg-amber-100 p-3 mb-4">
                          <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Survey Submission Pending Review</h3>
                        <Badge variant="outline" className="mb-4">
                          <Clock className="mr-1 h-3 w-3" /> Awaiting Researcher Review
                        </Badge>
                        <p className="text-gray-600 text-center mb-3">
                          Thank you for completing this survey. Your submission is currently being reviewed by the researcher.
                        </p>
                        <p className="text-gray-500 text-sm text-center">
                          You will receive {survey.points || 10} points once the researcher approves your submission.
                        </p>
                      </>
                    )}
                    
                    {submissionStatus === 'approved' && (
                      <>
                        <div className="rounded-full bg-green-100 p-3 mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Survey Submission Approved</h3>
                        <Badge variant="default" className="mb-4 bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" /> Approved
                        </Badge>
                        <p className="text-gray-600 text-center mb-3">
                          Congratulations! Your submission has been reviewed and approved by the researcher.
                        </p>
                        <p className="text-gray-500 text-sm text-center">
                          {survey.points || 10} points have been added to your account.
                        </p>
                      </>
                    )}
                    
                    {submissionStatus === 'rejected' && (
                      <>
                        <div className="rounded-full bg-red-100 p-3 mb-4">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Survey Submission Rejected</h3>
                        <Badge variant="destructive" className="mb-4">
                          <XCircle className="mr-1 h-3 w-3" /> Rejected
                        </Badge>
                        <p className="text-gray-600 text-center mb-3">
                          Unfortunately, your submission has been rejected by the researcher.
                        </p>
                        <p className="text-gray-500 text-sm text-center">
                          This could be due to incomplete or invalid responses. Please contact support for more information.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Survey Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created on</p>
                  <p className="font-medium">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Researcher</p>
                  <p className="font-medium">{survey.researcherName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium">{survey.institution}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="font-medium">{survey.points || 10} points per completion</p>
                </div>
                
                {survey.deadline && (
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">{new Date(survey.deadline).toLocaleDateString()}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    {survey.status === 'open' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <span className="h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {user.role === 'respondent' && (
              <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Need Help?</h3>
                <p className="text-gray-700 mb-4">
                  If you encounter any issues with this survey or have questions, please contact our support team.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetail;