import { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [historyStack, setHistoryStack] = useState([
    { screen: 'welcome', tab: 'dashboard', detailType: null, detailData: null, title: 'Welcome' }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentNavState = historyStack[currentIndex] || {
    screen: 'welcome',
    tab: 'dashboard',
    detailType: null,
    detailData: null,
  };

  const pushNavState = (newState) => {
    const currentState = historyStack[currentIndex];
    
    // Check if new state is functionally identical to avoid redundant duplicate entries
    if (
      currentState &&
      currentState.screen === (newState.screen || currentState.screen) &&
      currentState.tab === (newState.tab || currentState.tab) &&
      currentState.detailType === (newState.detailType !== undefined ? newState.detailType : currentState.detailType) &&
      JSON.stringify(currentState.detailData?.id || currentState.detailData || null) ===
        JSON.stringify(newState.detailData?.id || newState.detailData || null)
    ) {
      return;
    }

    const nextState = {
      screen: newState.screen || currentState?.screen || 'dashboard',
      tab: newState.tab || currentState?.tab || 'dashboard',
      detailType: newState.detailType !== undefined ? newState.detailType : (currentState?.detailType || null),
      detailData: newState.detailData !== undefined ? newState.detailData : (currentState?.detailData || null),
      title: newState.title || newState.tab || newState.screen || 'Page',
    };

    const updatedStack = historyStack.slice(0, currentIndex + 1).concat(nextState);
    setHistoryStack(updatedStack);
    setCurrentIndex(updatedStack.length - 1);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goForward = () => {
    if (currentIndex < historyStack.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < historyStack.length - 1;

  // Keyboard navigation shortcuts (Alt + Left Arrow -> Back, Alt + Right Arrow -> Forward)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        if (canGoBack) goBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        if (canGoForward) goForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoForward, currentIndex]);

  return (
    <NavigationContext.Provider
      value={{
        currentNavState,
        historyStack,
        currentIndex,
        pushNavState,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
