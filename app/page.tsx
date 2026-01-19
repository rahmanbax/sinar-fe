"use client"
import { useState, useRef, useCallback, useEffect, Suspense, useMemo } from "react";
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
  const [markerData, setMarkerData] = useState<ToponimMarkerItem | null>(null)
  const [openFilter, setOpenFilter] = useState(false)
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 119.450,
    latitude: -6.900,
    zoom: 4.55,
    bearing: 0,
    pitch: 0,
    padding: { bottom: 0 }
  })

  // Sync state from URL on load and changes
  useEffect(() => {
    if (markerId && lng && lat) {
      setMarkerData(prev => {
        // Only update if ID or coords changed to avoid unnecessary re-renders
        if (prev?.id === markerId) return prev
        return {
          id: markerId,
          name: '',
          category: '',
          element: '',
          coordinates: { lng: parseFloat(lng), lat: parseFloat(lat) }
        }
      })

      // If the map isn't loaded yet, don't setViewState here. 
      // Let Map.tsx:handleLoad handle the flyTo animation for that "wow" effect.
      // If we set it here, the map will jump to the coordinates instantly.
      if (!isInitialLoad.current) {
        setViewState({
          longitude: parseFloat(lng),
          latitude: parseFloat(lat),
          zoom: zoom ? parseFloat(zoom) : 15,
          bearing: 0,
          pitch: 0,
          padding: { bottom: 0 }
        })
      }
    }
  }, [markerId, lng, lat, zoom])

  const refresh = useCallback(async (viewStateParams: ((ViewState & { bounds: LngLatBounds }) | undefined)) => {
    const bounds = viewStateParams?.bounds
    const currentZoom = viewStateParams?.zoom

    apiHandler(
      'GET',
      `/toponyms/spatial/bounding-box?min_lat=${bounds?._sw.lat}&max_lat=${bounds?._ne.lat}&min_lng=${bounds?._sw.lng}&max_lng=${bounds?._ne.lng}&limit=${currentZoom && currentZoom > 10 ? 50 : 20}`
    ).then((r: BoundingBoxApiResponse) => {
      const mappedResults: ToponimMarkerItem[] = r.results.map((item: BoundingBoxToponymItem) => ({
        id: String(item.id), // Ensure ID is string
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
      if (isInitialLoad.current && markerId) {
        const found = r.find(i => String(i.id) === String(markerId))
        if (found) setMarkerData(found)
      }
    })

    isInitialLoad.current = false
  }, [apiHandler, markerId])

  // Merge selected marker into data if not already present
  const allMarkers = useMemo(() => {
    if (!markerData) return apiData
    const exists = apiData.some(m => String(m.id) === String(markerData.id))
    if (!exists && markerData.coordinates.lng !== 0) {
      return [...apiData, markerData]
    }
    return apiData
  }, [apiData, markerData])

  return (
    <PublicLayout>
      <MapDefault
        refreshMap={refresh}
        viewState={viewState}
        setViewState={setViewState}
        geoLocation={coords}
        markerItems={allMarkers}
        setMarkerData={setMarkerData}
        selectedMarker={markerData}
        setOpenFilter={setOpenFilter}
      />
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