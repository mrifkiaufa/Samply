
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'researcher') {
        navigate('/researcher-dashboard');
      } else {
        navigate('/respondent-dashboard');
      }
    }
  }, [user, navigate]);

  // If already logged in, don't render the registration form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 font-heading">Create Account</h2>
            <p className="text-gray-600">Join Samply to find research participants</p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-700">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;