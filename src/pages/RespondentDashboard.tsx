
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import SurveyCard, { Survey } from '../components/common/SurveyCard';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Topics for selection
const availableTopics = [
  "Education", "Psychology", "Healthcare", "Technology", 
  "Marketing", "Business", "Social Science", "Environment", 
  "Political Science", "Economics", "Communication"
];

const RespondentDashboard: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [completedSurveys, setCompletedSurveys] = useState<Survey[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(user?.selectedTopics || []);
  const [isEditingTopics, setIsEditingTopics] = useState(!user?.selectedTopics?.length);
  
  // Redirect if not logged in or not a respondent
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'respondent') {
      navigate('/researcher-dashboard');
    }
  }, [user, navigate]);
  
  // Load surveys from local storage or init with test data
  useEffect(() => {
    let storedSurveys = localStorage.getItem('samplySurveys');
    
    if (storedSurveys) {
      setSurveys(JSON.parse(storedSurveys));
    } else {
      // Initialize with some sample surveys
      const sampleSurveys = [
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
          status: "open" as const,
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
          status: "open" as const,
          formLink: "https://forms.google.com/sample2",
          points: 15
        },
        {
          id: "survey3",
          title: "Mental Health During COVID-19",
          description: "This research examines the impact of the COVID-19 pandemic on mental health and coping strategies across different demographic groups.",
          researcherName: "Dr. Sarah Williams",
          institution: "Public Health Institute",
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          topics: ["Psychology", "Healthcare", "Social Science"],
          respondentCount: 120,
          targetRespondents: 120,
          status: "closed" as const,
          formLink: "https://forms.google.com/sample3",
          points: 20
        },
        {
          id: "survey4",
          title: "Consumer Behavior in Sustainable Products",
          description: "A study on consumer attitudes and purchasing decisions regarding environmentally sustainable products and packaging.",
          researcherName: "Dr. Robert Garcia",
          institution: "Consumer Research Lab",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          topics: ["Marketing", "Business", "Environment"],
          respondentCount: 35,
          targetRespondents: 200,
          status: "open" as const,
          formLink: "https://forms.google.com/sample4",
          points: 12
        }
      ];
      
      setSurveys(sampleSurveys);
      localStorage.setItem('samplySurveys', JSON.stringify(sampleSurveys));
    }
  }, []);
  
  // Load user's completed surveys
  useEffect(() => {
    if (!user) return;
    
    const loadCompletedSurveys = () => {
      const submissionsStr = localStorage.getItem('surveySubmissions');
      if (!submissionsStr) return [];
      
      const submissions = JSON.parse(submissionsStr);
      return submissions.filter((sub: any) => 
        sub.userId === user.id && sub.status === 'approved'
      ).map((sub: any) => sub.surveyId);
    };
    
    const approvedSurveyIds = loadCompletedSurveys();
    
    if (surveys.length > 0 && approvedSurveyIds.length > 0) {
      const completed = surveys.filter(survey => approvedSurveyIds.includes(survey.id));
      setCompletedSurveys(completed);
    }
  }, [surveys, user]);

  // Filter surveys based on search query, topics, and completion status
  useEffect(() => {
    if (!surveys.length || !user) return;
    
    // Get list of surveys the user has submitted (pending or approved)
    const loadSubmittedSurveyIds = () => {
      const submissionsStr = localStorage.getItem('surveySubmissions');
      if (!submissionsStr) return [];
      
      const submissions = JSON.parse(submissionsStr);
      return submissions
        .filter((sub: any) => sub.userId === user.id)
        .map((sub: any) => sub.surveyId);
    };
    
    const submittedSurveyIds = loadSubmittedSurveyIds();
    
    let filtered = [...surveys];
    
    // Remove surveys that user has already submitted
    filtered = filtered.filter(survey => !submittedSurveyIds.includes(survey.id));
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(query) || 
        survey.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by selected topics if any are selected
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(survey => 
        survey.topics.some(topic => selectedTopics.includes(topic))
      );
    }
    
    // Only show open surveys
    filtered = filtered.filter(survey => survey.status === 'open');
    
    setFilteredSurveys(filtered);
  }, [surveys, searchQuery, selectedTopics, user]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };
  
  const saveTopics = () => {
    if (user) {
      updateUserProfile({ selectedTopics });
      setIsEditingTopics(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-heading">Respondent Dashboard</h1>
            <p className="text-gray-600">Find and complete surveys matching your interests</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4 md:mt-0 w-full md:w-auto">
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
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Interests</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsEditingTopics(!isEditingTopics)}
              size="sm"
            >
              {isEditingTopics ? 'Cancel' : 'Edit Interests'}
            </Button>
          </div>
          
          {isEditingTopics ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Select topics you're interested in to see relevant surveys:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant={selectedTopics.includes(topic) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTopics.includes(topic) 
                          ? 'bg-primary hover:bg-primary-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={saveTopics}>Save Interests</Button>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedTopics.length > 0 ? (
                selectedTopics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No interests selected yet. Click 'Edit Interests' to add some.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search surveys..."
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
        
        <Tabs defaultValue="available">
          <TabsList className="mb-6">
            <TabsTrigger value="available">Available Surveys</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            {filteredSurveys.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey}
                    viewType="respondent" 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
                <p className="text-gray-600">
                  {selectedTopics.length > 0 
                    ? "Try selecting different interests or check back later for new surveys."
                    : "Please select some interests to see relevant surveys."}
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed">
            {completedSurveys.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {completedSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey}
                    viewType="respondent" 
                    hideParticipateButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed surveys yet</h3>
                <p className="text-gray-600">
                  When you complete surveys and they are approved by researchers, they will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RespondentDashboard;