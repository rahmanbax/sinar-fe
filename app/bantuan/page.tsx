"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import MapDefault from "@/components/map/Map";

import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import POIDetailSidebar from "@/components/nav/POIDetailbar";
import FilterDialog from "@/components/FilterDialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
const Home = () => {
  const { coords,  } = useGeolocated({
      positionOptions: {
          enableHighAccuracy: true,
      },
      userDecisionTimeout: 10000,
      watchPosition: true,
  });

  const isInitialLoad = useRef(true)
  const [loading, setLoading] = useState(false)
  const apiHandler = useApiHandler({ setLoading, shouldHandleError: true })
  const [apiData, setData] = useState<NRB[]>([])
  const [searchString, setSearchString] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  const refresh = useCallback(() => {
      
  }, [apiHandler, searchString])

  useEffect(refresh, [refresh])

  return (
    <PublicLayout>
         <div className="mt-24">
            <div className="flex justify-center">
                <div className="flex gap-2 mt-4 h-10">
                    <Button variant='outline'>FAQ</Button>
                    <Button variant='outline'>Panduan Pengguna</Button>
                    <Button variant='outline'>Diskusi</Button>
                </div>
            </div>
            
        </div>
        
    </PublicLayout>
    
  );
}

export default Home