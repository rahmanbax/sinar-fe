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
            <div className="flex flex-col items-center text-center px-20">
                <h1 className="text-3xl font-bold mb-2">Gazeter Republik Indonesia</h1>
                <p className="text-wrap">adalah daftar yang berisi Nama Rupabumi baku, nama daerah, nama wilayah administrasi, dan nama ibu kota Negara Kesatuan Republik Indonesia</p>
                <div className="flex gap-2 mt-4 h-10">
                    <Button variant='outline'>Data Cetak</Button>
                    <Separator orientation="vertical" className="bg-black"/>
                    <Button variant='outline'>Data Tabular</Button>
                </div>
            </div>
        </div>
    </PublicLayout>
    
  );
}

export default Home