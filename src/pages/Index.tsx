
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKitchenStore } from '@/store';

const Index = () => {
  const { currentUser } = useKitchenStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // This is a placeholder - actual content is rendered in the Dashboard layout
  return null;
};

export default Index;
