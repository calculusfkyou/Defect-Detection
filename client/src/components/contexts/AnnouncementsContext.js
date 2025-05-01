import { createContext, useContext } from 'react';
import useAnnouncements from '../hooks/useAnnouncements';

const AnnouncementsContext = createContext();

export function AnnouncementsProvider({ children }) {
  const announcementsState = useAnnouncements();

  return (
    <AnnouncementsContext.Provider value={announcementsState}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncementsContext() {
  const context = useContext(AnnouncementsContext);
  if (context === undefined) {
    throw new Error('useAnnouncementsContext must be used within an AnnouncementsProvider');
  }
  return context;
}
