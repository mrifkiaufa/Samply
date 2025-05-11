
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    role: '' as UserRole | '',
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
    });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.role || !formData.name || !formData.email || !formData.password || !formData.institution) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        institution: formData.institution,
      });
      
      toast({
        title: "Registration successful!",
        description: "Welcome to Samply",
      });
      
      navigate(formData.role === 'respondent' ? '/respondent-dashboard' : '/researcher-dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold text-center mb-6 font-heading">
            Join as a
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleSelect('respondent')}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all"
            >
              <div className="bg-primary-50 rounded-full p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Respondent</h3>
              <p className="text-gray-600 text-sm text-center">
                Fill surveys and earn points
              </p>
            </button>
            
            <button
              onClick={() => handleRoleSelect('researcher')}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all"
            >
              <div className="bg-primary-50 rounded-full p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Researcher</h3>
              <p className="text-gray-600 text-sm text-center">
                Find respondents for your surveys
              </p>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-2xl font-bold mb-6 font-heading">
            Create your account
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.role === 'researcher' ? 'Research Institution' : 'School / University'}
            </label>
            <Input
              id="institution"
              name="institution"
              type="text"
              required
              value={formData.institution}
              onChange={handleChange}
              placeholder="Enter your institution"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(1)}
              className="w-full mt-3"
            >
              Back
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
