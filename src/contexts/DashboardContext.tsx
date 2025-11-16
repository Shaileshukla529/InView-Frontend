import { createContext, useContext, useState, ReactNode } from 'react';

type DashboardContextType = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const value = {selectedDate,setSelectedDate}
   
    return (
       <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
