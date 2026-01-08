"use client"
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import PublicLayout from "../layouts/PublicLayout";
import MapDefault from "@/components/map/Map";

import { useGeolocated } from "react-geolocated";
import { useApiHandler } from "@/utils/apiHandler";
import POIDetailSidebar from "@/components/nav/POIDetailbar";
import FilterDialog from "@/components/FilterDialog";
import { LngLatBounds, ViewState } from "@vis.gl/react-maplibre";
import { BoundingBoxToponymItem, ToponimMarkerItem } from "@/types/Toponim";
import { useSearchParams } from "next/navigation";

type BoundingBoxApiResponse = {
  count: number
  results: BoundingBoxToponymItem[]
}

const HomeContent = () => {
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
  const apiHandler = useApiHandler<BoundingBoxApiResponse>({ setLoading, shouldHandleError: false })
  const [apiData, setData] = useState<ToponimMarkerItem[]>([])
  const [markerData, setMarkerData] = useState<ToponimMarkerItem | null>(() => {
    if (markerId && lng && lat) {
      return {
        id: parseInt(markerId),
        name: '',
        category: '',
        element: '',
        coordinates: { lng: parseFloat(lng), lat: parseFloat(lat) }
      }
    }
    return null
  })
  const [openFilter, setOpenFilter] = useState(false)
  const [viewState, setViewState] = useState<ViewState>({
    longitude: lng ? parseFloat(lng) : 119.450,
    latitude: lat ? parseFloat(lat) : -6.900,
    zoom: zoom ? parseFloat(zoom) : 4.55,
    bearing: 0,
    pitch: 0,
    padding: { bottom: 0 }
  })

  const refresh = useCallback(async (viewState: ((ViewState & { bounds: LngLatBounds }) | undefined)) => {
    const bounds = viewState?.bounds
    const zoom = viewState?.zoom

    apiHandler(
      'GET',
      `/toponyms/spatial/bounding-box?min_lat=${bounds?._sw.lat}&max_lat=${bounds?._ne.lat}&min_lng=${bounds?._sw.lng}&max_lng=${bounds?._ne.lng}&limit=${zoom && zoom > 8 ? Math.ceil(zoom) : 8}`
    ).then((r: BoundingBoxApiResponse) => {
      const mappedResults: ToponimMarkerItem[] = r.results.map((item: BoundingBoxToponymItem) => ({
        id: item.id,
        name: item.local_name,
        category: item.category_name,
        element: item.element_name,
        coordinates: {
          lng: parseFloat(item.lng),
          lat: parseFloat(item.lat)
        }
      }))
      setData(mappedResults)
      return mappedResults
    }).then((r: ToponimMarkerItem[]) => {
      if (isInitialLoad.current && markerId && !isNaN(parseInt(markerId))) {
        const found = r.find(i => i.id === parseInt(markerId))
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

const Home = () => {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}

export default Home