
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-primary-500 font-heading font-bold text-xl">Samply</div>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-6 mr-4">
                <Link to={user.role === 'respondent' ? '/respondent-dashboard' : '/researcher-dashboard'} className="text-gray-700 hover:text-primary">
                  Dashboard
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline text-sm font-medium text-gray-600">
                  Hi, {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;