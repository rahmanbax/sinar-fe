"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import PublicLayout from "../layouts/PublicLayout";
import MapDefault from "@/components/map/Map";

import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import { NRB } from "@/types";
import POIDetailSidebar from "@/components/nav/POIDetailbar";
import FilterDialog from "@/components/FilterDialog";
import { LngLatBounds, ViewState } from "@vis.gl/react-maplibre";
import { ToponimMarkerItem } from "@/types/Toponim";
import { useSearchParams } from "next/navigation";
const Home = () => {
  const searchParams = useSearchParams()
  const lng = searchParams.get('lng')
  const lat = searchParams.get('lat')
  const markerId = searchParams.get('marker_id')
  const zoom = searchParams.get('zoom')

  const { coords, } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 10000,
    watchPosition: true,
  });

  const isInitialLoad = useRef(true)
  const [loading, setLoading] = useState(false)
  const apiHandler = useApiHandler<{results: ToponimMarkerItem[]}>({ setLoading, shouldHandleError: false })
  const [apiData, setData] = useState<ToponimMarkerItem[]>([])
  const [markerData, setMarkerData] = useState<ToponimMarkerItem | null>()
  const [openFilter, setOpenFilter] = useState(false)
  const [viewState, setViewState] = useState<ViewState>({
    longitude: lng ? parseFloat(lng) : 119.450 ,
    latitude: lat ? parseFloat(lat) : -6.900,
    zoom: zoom ? parseFloat(zoom) : 4.55,
    bearing: 0,
    pitch: 0,
    padding: { bottom: 0 }
  })

  const refresh = useCallback(async (viewState:((ViewState & {bounds: LngLatBounds}) | undefined)) => {
    const bounds = viewState?.bounds
    const zoom = viewState?.zoom

    apiHandler(
      'GET',
      `/toponyms/spatial/bounding-box?min_lat=${bounds?._sw.lat}&max_lat=${bounds?._ne.lat}&min_lng=${bounds?._sw.lng}&max_lng=${bounds?._ne.lng}&limit=${zoom && zoom > 8 ? Math.ceil(zoom) : 8}`
    ).then((r) => {
        setData(r.results) 
        return r.results
      }).then((r) => {
      if (markerId && !isNaN(parseInt(markerId))) {
        const found = r.find(r => r.id === parseInt(markerId))
        if (found) setMarkerData(found) 
      }
    })

    isInitialLoad.current = false
  }, [apiHandler, markerId])

  return (
    <PublicLayout>
      <MapDefault refreshMap={refresh} viewState={viewState} setViewState={setViewState} geoLocation={coords} markerItems={apiData} setMarkerData={setMarkerData} selectedMarker={markerData} setOpenFilter={setOpenFilter} />
      <POIDetailSidebar markerData={markerData} setMarkerData={setMarkerData} />
      <FilterDialog open={openFilter} setOpen={setOpenFilter} />
    </PublicLayout>

  );
}

export default Home