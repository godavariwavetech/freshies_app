import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubCategories } from '../services/api';

// Create the context
const SubCategoryContext = createContext();

// Context provider component
export const SubCategoryProvider = ({ children }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSubCategories();
        setSubCategories(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SubCategoryContext.Provider value={{ subCategories, loading, error }}>
      {children}
    </SubCategoryContext.Provider>
  );
};

// Custom hook to use the SubCategoryContext
export const useSubCategories = () => {
  const context = useContext(SubCategoryContext);
  if (!context) {
    throw new Error('useSubCategories must be used within a SubCategoryProvider');
  }
  return context;
};