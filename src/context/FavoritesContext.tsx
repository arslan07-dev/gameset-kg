import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedSetting, SettingsHistoryItem } from '../types';

interface FavoritesContextType {
  savedSettings: SavedSetting[];
  saveSetting: (setting: Omit<SavedSetting, 'id' | 'timestamp'>) => void;
  removeSetting: (id: string) => void;
  clearAllSettings: () => void;
  
  // Settings History
  settingsHistory: SettingsHistoryItem[];
  addToHistory: (item: Omit<SettingsHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  // Comparison State (up to 2 configurations)
  compareList: SavedSetting[];
  addToCompare: (setting: SavedSetting) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;

  isSavedModalOpen: boolean;
  setIsSavedModalOpen: (open: boolean) => void;
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'gameset_kg_favorites_v1';
const HISTORY_STORAGE_KEY = 'gameset_kg_history_v1';
const COMPARE_STORAGE_KEY = 'gameset_kg_compare_v1';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedSettings, setSavedSettings] = useState<SavedSetting[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
    return [];
  });

  const [settingsHistory, setSettingsHistory] = useState<SettingsHistoryItem[]>(() => {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load history', e);
    }
    return [];
  });

  const [compareList, setCompareList] = useState<SavedSetting[]>(() => {
    try {
      const data = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load compare list', e);
    }
    return [];
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSettings));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [savedSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(settingsHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [settingsHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
    } catch (e) {
      console.error('Failed to save compare list to localStorage', e);
    }
  }, [compareList]);

  const saveSetting = (setting: Omit<SavedSetting, 'id' | 'timestamp'>) => {
    const newEntry: SavedSetting = {
      ...setting,
      id: 'cfg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setSavedSettings((prev) => [newEntry, ...prev]);
  };

  const removeSetting = (id: string) => {
    setSavedSettings((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllSettings = () => {
    setSavedSettings([]);
  };

  const addToHistory = (item: Omit<SettingsHistoryItem, 'id' | 'timestamp'>) => {
    const newHistoryItem: SettingsHistoryItem = {
      ...item,
      id: 'hist_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    // Keep max 10 recent items
    setSettingsHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
  };

  const clearHistory = () => {
    setSettingsHistory([]);
  };

  const addToCompare = (setting: SavedSetting): boolean => {
    if (compareList.length >= 2) {
      // Replace second item
      setCompareList([compareList[0], setting]);
      return true;
    }
    if (compareList.some((c) => c.id === setting.id)) {
      return false; // Already present
    }
    setCompareList([...compareList, setting]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        savedSettings,
        saveSetting,
        removeSetting,
        clearAllSettings,
        settingsHistory,
        addToHistory,
        clearHistory,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isSavedModalOpen,
        setIsSavedModalOpen,
        isProModalOpen,
        setIsProModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
