/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {useNavigate, useLocation} from 'react-router';

interface TabContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  tabCount: number;
  setTabCount: (count: number) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

type TabProviderProps = {
  children: React.ReactNode;
};

export const TabProvider = ({children}: TabProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabCount, setTabCount] = useState(0);

  const getTabFromUrl = useCallback((): number => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    return tabParam ? parseInt(tabParam, 10) : 0;
  }, [location.search]);

  const setActiveTab = useCallback(
    (tab: number) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', tab.toString());
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate(
        {
          pathname: location.pathname,
          search: searchParams.toString(),
        },
        {replace: true},
      );
    },
    [navigate, location],
  );

  const activeTab = getTabFromUrl();

  useEffect(() => {
    if (tabCount > 0 && activeTab >= tabCount) {
      setActiveTab(0);
    }
  }, [tabCount, activeTab, setActiveTab]);

  const value = useMemo(
    () => ({activeTab, setActiveTab, tabCount, setTabCount}),
    [activeTab, setActiveTab, tabCount],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

export function useTab() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
}
