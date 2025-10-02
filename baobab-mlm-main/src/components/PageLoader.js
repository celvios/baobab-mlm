import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

const PageLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return children;
};

export default PageLoader;