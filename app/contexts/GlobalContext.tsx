'use client';
import React, { createContext, useContext } from "react";

const GlobalContext = createContext({isMobile: false, isLoading: false})

export interface IGlobalProviderContext {
    children: React.ReactNode
    isMobile: boolean
    isLoading: boolean
}

const GlobalContextProvider : React.FC<React.PropsWithChildren<IGlobalProviderContext>> = ({ children, isMobile, isLoading } ) => {
    return (
        <GlobalContext.Provider value={{isMobile, isLoading}}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobalContext = () => useContext(GlobalContext)

export default GlobalContextProvider;