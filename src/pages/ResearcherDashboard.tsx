
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import SurveyCard, { Survey } from '../components/common/SurveyCard';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Topics for selection
const availableTopics = [
  "Education", "Psychology", "Healthcare", "Technology", 
  "Marketing", "Business", "Social Science", "Environment", 
  "Political Science", "Economics", "Communication"
];

const ResearcherDashboard: React.FC = () => {
  const { user, updateUserPoints } = useAuth();
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSurveyOpen, setIsAddSurveyOpen] = useState(false);
  
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    topics: [] as string[],
    targetRespondents: 50,
    formLink: '',
    points: 10, // Default points
    deadline: '', // Survey deadline
  });
  
  // Check for expired surveys
  useEffect(() => {
    const checkExpiredSurveys = () => {
      const storedSurveys = localStorage.getItem('samplySurveys');
      if (!storedSurveys) return;
      
      const allSurveys: Survey[] = JSON.parse(storedSurveys);
      
      // Check for surveys with deadlines that have passed
      const currentDate = new Date();
      let hasChanges = false;
      
      const updatedSurveys = allSurveys.map(survey => {
        if (survey.status === 'open' && survey.deadline) {
          const deadlineDate = new Date(survey.deadline);
          if (currentDate > deadlineDate) {
            hasChanges = true;
            return { ...survey, status: 'closed', closedAt: new Date().toISOString() };
          }
        }
        return survey;
      });
      
      if (hasChanges) {
        localStorage.setItem('samplySurveys', JSON.stringify(updatedSurveys));
        // Update the current display if researcher is logged in
        if (user?.role === 'researcher') {
          setSurveys(updatedSurveys);
        }
      }
    };
    
    // Check on initial load and set up interval
    checkExpiredSurveys();
    const interval = setInterval(checkExpiredSurveys, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Redirect if not logged in or not a researcher
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'researcher') {
      navigate('/respondent-dashboard');
    }
  }, [user, navigate]);
  
  // Load surveys from local storage or init with test data
  useEffect(() => {
    let storedSurveys = localStorage.getItem('samplySurveys');
    
    if (storedSurveys) {
      const allSurveys = JSON.parse(storedSurveys);
      setSurveys(allSurveys);
    } else {
      // Initialize with some sample surveys
      const sampleSurveys: Survey[] = [
        {
          id: "survey1",
          title: "User Experience in Mobile Banking Apps",
          description: "This survey aims to understand user preferences and pain points when using mobile banking applications. Your feedback will help improve future banking apps.",
          researcherName: "Dr. Emily Chen",
          institution: "Digital Finance Institute",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          topics: ["Technology", "Business", "Economics"],
          respondentCount: 42,
          targetRespondents: 100,
          status: "open",
          formLink: "https://forms.google.com/sample1",
          points: 10
        },
        {
          id: "survey2",
          title: "Remote Learning Effectiveness Study",
          description: "A research study to evaluate the effectiveness of remote learning tools and methodologies in higher education during and after the pandemic.",
          researcherName: "Prof. Michael Johnson",
          institution: "Education Research Center",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          topics: ["Education", "Technology", "Psychology"],
          respondentCount: 87,
          targetRespondents: 150,
          status: "open",
          formLink: "https://forms.google.com/sample2",
          points: 15
        },
      ];
      
      setSurveys(sampleSurveys);
      localStorage.setItem('samplySurveys', JSON.stringify(sampleSurveys));
    }
  }, []);
  
  // Filter researcher's own surveys
  useEffect(() => {
    if (!user || !surveys.length) return;
    
    let filtered = surveys.filter(survey => survey.researcherName === user.name);
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(query) || 
        survey.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSurveys(filtered);
  }, [surveys, searchQuery, user]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewSurvey({
      ...newSurvey,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSurvey({
      ...newSurvey,
      [e.target.name]: parseInt(e.target.value) || 0,
    });
  };
  
  const handleTopicSelect = (topic: string) => {
    if (newSurvey.topics.includes(topic)) {
      setNewSurvey({
        ...newSurvey,
        topics: newSurvey.topics.filter(t => t !== topic),
      });
    } else {
      setNewSurvey({
        ...newSurvey,
        topics: [...newSurvey.topics, topic],
      });
    }
  };
  
  const handleTargetChange = (value: string) => {
    setNewSurvey({
      ...newSurvey,
      targetRespondents: parseInt(value),
    });
  };
  
  const handleAddSurvey = () => {
    if (!user) return;
    
    if (!newSurvey.title || !newSurvey.description || !newSurvey.formLink || newSurvey.topics.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields and select at least one topic",
        variant: "destructive",
      });
      return;
    }
    
    // Validate points
    if (newSurvey.points <= 0) {
      toast({
        title: "Invalid points",
        description: "Points must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Check if the researcher has enough points
    if (!user.points || user.points < newSurvey.points) {
      toast({
        title: "Insufficient points",
        description: `You need at least ${newSurvey.points} points to create this survey. You currently have ${user.points || 0} points.`,
        variant: "destructive",
      });
      return;
    }
    
    const survey: Survey = {
      id: `survey_${Date.now()}`,
      title: newSurvey.title,
      description: newSurvey.description,
      researcherName: user.name,
      institution: user.institution || '',
      createdAt: new Date().toISOString(),
      topics: newSurvey.topics,
      respondentCount: 0,
      targetRespondents: newSurvey.targetRespondents,
      status: 'open',
      formLink: newSurvey.formLink,
      points: newSurvey.points,
      deadline: newSurvey.deadline || undefined,
    };
    
    const updatedSurveys = [...surveys, survey];
    setSurveys(updatedSurveys);
    localStorage.setItem('samplySurveys', JSON.stringify(updatedSurveys));
    
    // Deduct points from researcher
    const newPoints = (user.points || 0) - newSurvey.points;
    updateUserPoints(newPoints);
    
    setNewSurvey({
      title: '',
      description: '',
      topics: [],
      targetRespondents: 50,
      formLink: '',
      points: 10,
      deadline: '',
    });
    
    setIsAddSurveyOpen(false);
    
    toast({
      title: "Survey added successfully",
      description: `Your survey has been published and is now visible to respondents. ${newSurvey.points} points have been deducted from your account.`,
    });
  };
  
  const handleCloseSurvey = (surveyId: string) => {
    if (!user) return;
    
    const updatedSurveys = surveys.map(survey => {
      if (survey.id === surveyId) {
        return { ...survey, status: 'closed', closedAt: new Date().toISOString() };
      }
      return survey;
    });
    
    setSurveys(updatedSurveys);
    localStorage.setItem('samplySurveys', JSON.stringify(updatedSurveys));
    
    toast({
      title: "Survey closed",
      description: "The survey has been closed and is no longer accepting responses",
    });
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-heading">Researcher Dashboard</h1>
            <p className="text-gray-600">Manage your surveys and responses</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 014-4h1a3 3 0 013 3v1a2 2 0 01-2 2h-1.5M12 8l-3-3m0 0l-3 3m3-3v13" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Your Points</div>
                  <div className="text-xl font-bold">{user.points || 0}</div>
                </div>
              </div>
            </div>
            
            <Dialog open={isAddSurveyOpen} onOpenChange={setIsAddSurveyOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Survey
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Survey</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Title*
                    </label>
                    <Input 
                      id="title" 
                      name="title"
                      value={newSurvey.title}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive title for your survey"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={newSurvey.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe what your survey is about and why people should participate"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="topics" className="block text-sm font-medium text-gray-700 mb-1">
                      Topics* (Select at least one)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTopics.map((topic) => (
                        <Badge
                          key={topic}
                          variant={newSurvey.topics.includes(topic) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            newSurvey.topics.includes(topic) 
                              ? 'bg-primary hover:bg-primary-700' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleTopicSelect(topic)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="targetRespondents" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Number of Respondents
                      </label>
                      <Select 
                        onValueChange={handleTargetChange}
                        defaultValue="50"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 respondents</SelectItem>
                          <SelectItem value="20">20 respondents</SelectItem>
                          <SelectItem value="50">50 respondents</SelectItem>
                          <SelectItem value="100">100 respondents</SelectItem>
                          <SelectItem value="200">200 respondents</SelectItem>
                          <SelectItem value="500">500 respondents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                        Points per Response
                      </label>
                      <Input
                        id="points"
                        name="points"
                        type="number"
                        min="1"
                        value={newSurvey.points}
                        onChange={handleNumberInputChange}
                        placeholder="10"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        You have {user.points || 0} points available
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline (Optional)
                    </label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={newSurvey.deadline}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Survey will automatically close after this date
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="formLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Google Form Link*
                    </label>
                    <Input 
                      id="formLink" 
                      name="formLink"
                      value={newSurvey.formLink}
                      onChange={handleInputChange}
                      placeholder="https://forms.google.com/..."
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSurveyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSurvey}>
                    Create Survey
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search your surveys..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Surveys</TabsTrigger>
            <TabsTrigger value="closed">Closed Surveys</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {filteredSurveys.filter(s => s.status === 'open').length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredSurveys
                  .filter(survey => survey.status === 'open')
                  .map((survey) => (
                    <div key={survey.id} className="relative">
                      <SurveyCard 
                        survey={survey} 
                        viewType="researcher" 
                      />
                      <div className="absolute top-4 right-4">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCloseSurvey(survey.id)}
                        >
                          Close Survey
                        </Button>
                      </div>
                      <div className="mt-2 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="font-medium">Points:</span>{' '}
                            <span>{survey.points || 10} per response</span>
                          </div>
                          {survey.deadline && (
                            <div>
                              <span className="font-medium">Deadline:</span>{' '}
                              <span>{new Date(survey.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active surveys</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any active surveys. Create your first survey to start collecting responses.
                </p>
                <Button onClick={() => setIsAddSurveyOpen(true)}>
                  Create Your First Survey
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="closed">
            {filteredSurveys.filter(s => s.status === 'closed').length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredSurveys
                  .filter(survey => survey.status === 'closed')
                  .map((survey) => (
                    <div key={survey.id}>
                      <SurveyCard 
                        key={survey.id} 
                        survey={survey} 
                        viewType="researcher" 
                      />
                      <div className="mt-2 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="font-medium">Points:</span>{' '}
                            <span>{survey.points || 10} per response</span>
                          </div>
                          {survey.deadline && (
                            <div>
                              <span className="font-medium">Deadline:</span>{' '}
                              <span>{new Date(survey.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Closed On:</span>{' '}
                            <span>
                              {survey.closedAt 
                                ? new Date(survey.closedAt).toLocaleDateString() 
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No closed surveys</h3>
                <p className="text-gray-600">
                  You don't have any closed surveys yet. When you close a survey, it will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResearcherDashboard;