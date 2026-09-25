import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { App } from './App';
import { useGameStore } from '../state/gameStore';

const RouteSync: React.FC = () => {
  const location = useLocation();
  const { setActiveTab } = useGameStore();

  useEffect(() => {
    if (location.pathname === '/dev/simulation') {
      setActiveTab('dev');
    }
  }, [location.pathname, setActiveTab]);

  return <App />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<RouteSync />} />
      </Routes>
    </BrowserRouter>
  );
};
