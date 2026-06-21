import { createContext, useContext, type ReactNode } from 'react';

type CameraFlowContextValue = {
  reportBackgroundSaveError: (message: string) => void;
};

const CameraFlowContext = createContext<CameraFlowContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  reportBackgroundSaveError: (message: string) => void;
};

export function CameraFlowProvider({ children, reportBackgroundSaveError }: ProviderProps) {
  return (
    <CameraFlowContext.Provider value={{ reportBackgroundSaveError }}>
      {children}
    </CameraFlowContext.Provider>
  );
}

export function useCameraFlowContext(): CameraFlowContextValue {
  const context = useContext(CameraFlowContext);
  if (!context) {
    throw new Error('useCameraFlowContext must be used within CameraFlowProvider');
  }
  return context;
}
