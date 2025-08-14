import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthGuard({ children, fallback, title, description }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      {fallback ? (
        <div onClick={handleClick} className="cursor-pointer">
          {fallback}
        </div>
      ) : (
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
      )}
      
      <AuthModal
        open={showModal}
        onOpenChange={setShowModal}
        title={title}
        description={description}
      />
    </>
  );
}