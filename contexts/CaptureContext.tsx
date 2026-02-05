import { createContext, useContext, useState, ReactNode } from 'react';
import type { CapturedData } from '@/types/face-validation';

interface CaptureContextType {
  capturedData: CapturedData | null;
  setCapturedData: (data: CapturedData | null) => void;
}

const CaptureContext = createContext<CaptureContextType | undefined>(undefined);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);

  return (
    <CaptureContext.Provider value={{ capturedData, setCapturedData }}>
      {children}
    </CaptureContext.Provider>
  );
}

export function useCaptureData() {
  const context = useContext(CaptureContext);
  if (context === undefined) {
    throw new Error('useCaptureData must be used within a CaptureProvider');
  }
  return context;
}
