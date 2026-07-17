"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface BrowseSearchContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const BrowseSearchContext = createContext<BrowseSearchContextValue | null>(
  null,
);

export function BrowseSearchProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [search, setSearchState] = useState("");
  const setSearch = useCallback((value: string): void => {
    setSearchState(value);
  }, []);

  const value = useMemo(
    () => ({
      search,
      setSearch,
    }),
    [search, setSearch],
  );

  return (
    <BrowseSearchContext.Provider value={value}>
      {children}
    </BrowseSearchContext.Provider>
  );
}

export function useBrowseSearch(): BrowseSearchContextValue {
  const context = useContext(BrowseSearchContext);
  if (!context) {
    throw new Error("useBrowseSearch must be used within BrowseSearchProvider");
  }
  return context;
}
