"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "../layouts/PublicLayout";
import MapDefault from "@/components/map/Map";

import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import POIDetailSidebar from "@/components/nav/POIDetailbar";
import FilterDialog from "@/components/FilterDialog";
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
  const [dataId, setDataId] = useState<string | null>(null)
  const [openFilter, setOpenFilter] = useState(false)
  const [searchString, setSearchString] = useState<string | undefined>()
  const [openLoginDialog, setOpenLoginDialog] = useState(false)
  const [searchResult, setSearchResult] = useState<NRB[]>([])
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState([])

  const refresh = useCallback(() => {
      apiHandler('GET', `/nrb`).then(r => {
        setData(r)
      })

      

      if(searchString && searchString.length > 2) {
        apiHandler('GET', `/nrb?limit=${limit}&search=${searchString}`)
        .then(r => {
            setSearchResult(r)
        })
      }

      isInitialLoad.current = false
  }, [apiHandler, searchString, limit])

  useEffect(() => {refresh();}, [refresh])

  return (
    <PublicLayout>
      <MapDefault geoLocation={coords} loading={loading} data={apiData} setDataId={setDataId} dataId={dataId} setOpenFilter={setOpenFilter} setSearchString={setSearchString} />
      <POIDetailSidebar dataId={dataId} setDataId={setDataId}/>
      <FilterDialog open={openFilter} setOpen={setOpenFilter}/>
    </PublicLayout>
    
  );
}

export default Home