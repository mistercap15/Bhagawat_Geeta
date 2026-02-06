import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface TabBarVisibilityContextValue {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | undefined>(undefined);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisibleState] = useState(true);

  const setVisible = useCallback((nextVisible: boolean) => {
    setVisibleState((prev) => (prev === nextVisible ? prev : nextVisible));
  }, []);

  const value = useMemo(() => ({ visible, setVisible }), [visible, setVisible]);

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error("useTabBarVisibility must be used within TabBarVisibilityProvider");
  }
  return context;
}
