import React from 'react';
import SurveyorNav from './SurveyorNav';
import { ChevronDown } from 'lucide-react';

interface SurveyorLayoutProps {
    children: React.ReactNode;
}

const SurveyorLayout = ({ children }: SurveyorLayoutProps) => {
    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <SurveyorNav />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-end shrink-0">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="text-right">
                            <p className="text-sm font-bold text-navy-900 leading-tight">John Doe</p>
                            <p className="text-xs text-gray-500 mt-1">Surveyor</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                    </div>
                </header>
                
                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default SurveyorLayout;