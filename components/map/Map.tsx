/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useRef, SetStateAction, Dispatch, useCallback, useMemo } from 'react';
import Map, { Marker, GeolocateControl, GeolocateResultEvent, type MapRef, type ViewState, NavigationControl, ViewStateChangeEvent, LngLatBounds } from '@vis.gl/react-maplibre'
import { IoLocationSharp, IoLocationOutline } from 'react-icons/io5'
import { DEV_MODE } from '@/lib/config';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Minus, Plus, LocateFixed, Layers, Download, Search, SlidersVertical, Loader2, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { NRB } from '@/types';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { motion } from 'framer-motion'
import { ToponimMarkerItem, ToponymAnnouncementTabular } from '@/types/Toponim';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ParsedUrlQuery } from 'querystring';
import { useApiHandler } from '@/utils/apiHandler';
import AutoComplete from '../AutoComplete';

const MAP_STYLE_SRC = 'https://api.maptiler.com/maps/hybrid/style.json?key=LKoyDpZYXFZFev1xFoUc'

export const big_office_coord = {
  longitude: 106.8467944,
  latitude: -6.4908661,
}

export const MapStyles = [
  {
    id: 'street-v4',
    label: 'Street',
    abbrv: 'Street',
    src: 'https://api.maptiler.com/maps/streets-v4/style.json?key=LKoyDpZYXFZFev1xFoUc',
    preview: 'https://cloud.maptiler.com/static/img/maps/streets-v4.png?t=1760544391'
  },
  {
    id: 'satellite',
    label: 'Satellite',
    abbrv: 'Sat-Img',
    src: 'https://api.maptiler.com/maps/satellite/style.json?key=LKoyDpZYXFZFev1xFoUc',
    preview: 'https://cloud.maptiler.com/static/img/maps/satellite.png?t=1755757107'
  },
  {
    id: 'openstreetmap',
    label: 'Open Street Map',
    abbrv: 'OSM',
    src: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=LKoyDpZYXFZFev1xFoUc',
    preview: 'https://cloud.maptiler.com/static/img/maps/openstreetmap.png?t=1755757107'
  },
  {
    id: 'aerial',
    label: 'Aerial',
    abbrv: 'Aerial',
    src: 'https://api.maptiler.com/maps/hybrid/style.json?key=LKoyDpZYXFZFev1xFoUc',
    preview: 'https://media.maptiler.com/img/xlarge_port_59a30dff58.webp'
  },
  {
    id: 'topo-v2',
    label: 'Topografi',
    abbrv: 'Topo',
    src: 'https://api.maptiler.com/maps/topo-v2/style.json?key=LKoyDpZYXFZFev1xFoUc',
    preview: 'https://cloud.maptiler.com/static/img/maps/topo-v2.png?t=1755757107'
  }
]

interface ILabeledMarker {
  data: ToponimMarkerItem
  longitude: number
  latitude: number
  label: string
  handleMouseEnter: (data: ToponimMarkerItem) => void
  handleMouseLeave: () => void
  hovered: boolean
  handleOnClick: (data: ToponimMarkerItem) => void
  selected: boolean
}

const LabeledMarker: React.FC<ILabeledMarker> = ({ data, longitude, latitude, label, handleMouseEnter, handleMouseLeave, hovered, handleOnClick, selected }) => {
  const isActive = hovered || selected

  return (
    <Marker
      pitchAlignment='map'
      anchor='center'
      latitude={latitude} longitude={longitude}
      className='hover:cursor-pointer'
      onClick={() => handleOnClick(data)}
    >
      <motion.div
        className="relative flex flex-col items-center cursor-pointer"
        onMouseEnter={() => handleMouseEnter(data)}
        onMouseLeave={handleMouseLeave}
        animate={{
          scale: isActive ? 1.25 : 1,
          y: isActive ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <motion.div
          animate={{
            boxShadow: isActive
              ? "0px 0px 12px rgba(0, 191, 255, 0.6)"
              : "0px 0px 0px rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.2 }}
          className="rounded-full"
        >
          {selected ? (
            <IoLocationSharp className='text-3xl transition-colors duration-300 text-blue-600 drop-shadow-lg' />
          )
            : (<IoLocationOutline className={`text-3xl transition-colors duration-300 text-blue-600 ${hovered && 'drop-shadow'}`} />)}

        </motion.div>

        {(hovered || selected) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-1 bg-white py-1 px-2 rounded-sm border whitespace-nowrap shadow text-xs"
          >
            {label}
          </motion.div>
        )}
      </motion.div>
    </Marker>
  )
}

interface IMapDefault {
  refreshMap: (v?: ViewState & { bounds: LngLatBounds }) => Promise<void>
  geoLocation?: GeolocationCoordinates
  viewState: ViewState
  setViewState: Dispatch<SetStateAction<ViewState>>
  selectedMarker?: ToponimMarkerItem | null
  setMarkerData: (data: ToponimMarkerItem) => void
  markerItems?: ToponimMarkerItem[]
  setOpenFilter: (open: boolean) => void
}
/*
Usage:
<MapLibreZoomToggle />
- Requires @vis.gl/react-maplibre
- Tailwind used for styling
- Supports zooming, reset view, and toggle UI visibility
*/
const MapDefault: React.FC<IMapDefault> = (
  { refreshMap, viewState, setViewState, geoLocation, markerItems, selectedMarker, setMarkerData, setOpenFilter }) => {
  const mapRef = useRef<MapRef>(null);
  const flyToInProgress = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoRef = useRef<maplibregl.GeolocateControl>(null);
  const [loading, setLoading] = useState(false)
  const apiHandler = useApiHandler<ToponymAnnouncementTabular[]>({ setLoading, shouldHandleError: false })
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [loadingStyle, setLoadingStyle] = useState(false)
  const [mapStyle, setMapStyle] = useState(MapStyles[0])
  const [onHover, setOnHover] = useState<string | undefined>()


  const [listData, setListData] = useState<ToponymAnnouncementTabular[]>([])
  const [searchString, setSearchString] = useState<string>("")
  const [filters, setFilters] = useState([])
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Not strictly needed for clearing all, but good practice

  const getViewFromMap = useCallback((ref: React.RefObject<MapRef | null>): (ViewState & { bounds: LngLatBounds }) | undefined => {
    const map = ref.current?.getMap()
    if (!map) return
    return {
      longitude: map.getCenter().lng ?? 0,
      latitude: map.getCenter().lat ?? 0,
      zoom: map.getZoom() ?? 10,
      bearing: map.getBearing() ?? 0,
      pitch: map.getPitch() ?? 0,
      bounds: map.getBounds(),
      padding: map.getPadding()
    }
  }, [])

  const handleClearParams = () => {
    router.replace(pathname, { scroll: false });
  };

  const objToParams = (k: Record<string, string | number | string[] | number[]>): string => {
    return new URLSearchParams(Object.entries(k)
      .flatMap(([key, value]) =>
        Array.isArray(value)
          ? value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          : [`${encodeURIComponent(key)}=${encodeURIComponent(value.toString() ?? '')}`]
      )
      .join('&')).toString();
  }

  const handleOnGeoLocate = (e: GeolocateResultEvent) => {
    const coords = e.coords;
    handleMapFlyTo(coords.longitude, coords.latitude)
  }

  const geoLocateTrigger = () => {
    geoRef.current?.trigger()
  }

  const handleZoomIn = () => {
    mapRef.current?.zoomTo(
      (mapRef.current?.getZoom() ?? 12) + 0.5,
      { duration: 300 }
    )
  }

  const handleZoomOut = () => {
    mapRef.current?.zoomTo(
      Math.max((mapRef.current?.getZoom() ?? 12) - 0.5, 0),
      { duration: 300 }
    )
  }


  const handleChangeMapStyle = (style: typeof mapStyle) => {
    if (style.id !== mapStyle.id) {
      setLoadingStyle(true)
      setMapStyle(style)
    }
  }

  const handleLoad = useCallback(() => {
    const view = getViewFromMap(mapRef)
    if (!view) return

    // Check if URL has coordinates to fly to
    const urlLng = searchParams.get('lng')
    const urlLat = searchParams.get('lat')
    const urlZoom = searchParams.get('zoom')

    if (urlLng && urlLat) {
      mapRef.current?.flyTo({
        center: [parseFloat(urlLng), parseFloat(urlLat)],
        zoom: urlZoom ? parseFloat(urlZoom) : 15,
        duration: 2000,
        essential: true,
      })
    }

    refreshMap(view)
  }, [refreshMap, getViewFromMap, searchParams])


  const handleLoadMapStyle = () => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const handleStyleData = () => setLoadingStyle(false)
    map.on('styledata', handleStyleData)

    return () => {
      if (map && map.listens('styledata')) {
        map.off('styledata', handleStyleData)
      }
    }
  }

  const onSearchChange = (val: string) => {
    setSearchString(val)
  }

  const handleMapFlyTo = useCallback((lng: number, lat: number) => {
    flyToInProgress.current = true

    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1000,
      essential: true,
    })

    const view = getViewFromMap(mapRef)

    refreshMap(view)
  }, [refreshMap, getViewFromMap])


  const handleMarkerOnClick = useCallback((d: ToponimMarkerItem) => {
    setMarkerData(d)
    const poi = markerItems?.find(i => i.id === d.id)
    if (poi) {
      const params = objToParams({ marker_id: poi.id, lng: poi.coordinates.lng, lat: poi.coordinates.lat, zoom: 15 })
      router.push(`${pathname}?${params}`)
      handleMapFlyTo(poi.coordinates.lng, poi.coordinates.lat)
    }
  }, [handleMapFlyTo, markerItems, pathname, setMarkerData, router])


  const handleOnSearchSelect = (id: string) => {
    const v = listData.find(d => d.id === id)
    if (!v) return
    const markerData: ToponimMarkerItem = {
      id: v.id,
      category: v.element?.name || '-',
      coordinates: {
        lng: v.location_point?.coordinates[0] ?? 0,
        lat: v.location_point?.coordinates[1] ?? 0
      },
      element: v.element?.name || '-',
      name: v.map_name
    }
    setMarkerData(markerData)
    const params = objToParams({ marker_id: markerData.id, lng: markerData.coordinates.lng, lat: markerData.coordinates.lat, zoom: 15 })
    router.push(`${pathname}?${params}`)
    handleMapFlyTo(markerData.coordinates.lng, markerData.coordinates.lat)

    // Clear search bar and results list
    setSearchString("")
    setListData([])
  }

  const handleMoveEnd = useCallback(() => {
    const view = getViewFromMap(mapRef)

    if (!view) return

    // Case 2: user drag / zoom → debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      refreshMap(view)
    }, 700)

  }, [refreshMap, getViewFromMap])

  const markers = useMemo(() => {
    return markerItems && markerItems.length
      && markerItems.map(d => (
        <LabeledMarker
          key={d.id}
          data={d}
          latitude={d.coordinates.lat}
          longitude={d.coordinates.lng}
          label={d.name}
          handleOnClick={handleMarkerOnClick}
          selected={String(selectedMarker?.id) === String(d.id)}
          handleMouseEnter={() => setOnHover(String(d.id))}
          handleMouseLeave={() => setOnHover(undefined)}
          hovered={onHover === String(d.id)}
        />
      ))
  }, [markerItems, handleMarkerOnClick, selectedMarker, onHover])

  useEffect(handleLoadMapStyle, [mapStyle])
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const handleChange = () => {
      handleMoveEnd()
    }

    map.on("moveend", handleChange)
    map.on("zoomend", handleChange)
    return () => {
      map.off("moveend", handleChange)
      map.off("zoomend", handleChange)
    }
  }, [handleMoveEnd])

  useEffect(() => {
    if (!searchString || searchString.length < 3) {
      setListData([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      apiHandler(
        'GET',
        `/toponyms?search=${encodeURIComponent(searchString)}`,
        undefined, // body
        undefined,
        { signal: controller.signal }
      )
        .then((r: any) => {
          // If the API returns a paginated response or direct array, handle it
          const results = Array.isArray(r) ? r : r?.data || []
          setListData(results)
        })
        .catch((e) => {
          if (e.name !== 'AbortError') console.error(e)
        })
    }, 400)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchString, apiHandler])

  return (
    <div className='flex justify-center min-w-[95vw] min-h-screen'>
      {loadingStyle && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <Loader2 className="animate-spin mb-2 w-10 h-10" />
          <p className="text-sm font-medium">Loading map style...</p>
        </div>
      )}
      <Map
        ref={mapRef}
        {...viewState}
        style={{ width: '100vw', height: 'max' }}
        mapStyle={mapStyle.src ?? MAP_STYLE_SRC}
        onLoad={handleLoad}
        onMove={e => setViewState(e.viewState)}
        onMoveEnd={handleMoveEnd}
        maxBounds={[
          [91, -12],   // Sudut barat daya Indonesia (lon, lat) + 5
          [142, 12]     // Sudut timur laut Indonesia (lon, lat) + 5
        ]}
      >

        <div className="w-[90vw] absolute top-25 sm:top-22 left-1/2 -translate-x-1/2 z-3 flex gap-2 sm:left-5 sm:translate-x-0 sm:w-[50vw] md:w-[40vw] lg:w-96">
          {/* <InputGroup className='bg-neutral-50'>
            <InputGroupInput placeholder="Search..." onChange={(e) => onSearchChange(e.target.value)} />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup> */}
          <AutoComplete
            placeholder='Cari Data'
            valueField='id'
            items={listData}
            labelField='local_name'
            onSearchValueChange={onSearchChange}
            onSelectedValueChange={handleOnSearchSelect}
            searchValue={searchString}
            isLoading={loading}
            clearOnSelect={true}
            renderItem={(v) => (<div>
              <h4 className='font-semibold'>{v.local_name}</h4>
              <h5 className='text-muted-foreground'>{v.map_name}</h5>
              <h5 className='text-muted-foreground text-wrap'>
                {[v.village?.name, v.district?.name, v.regency?.name, v.province?.name].filter(Boolean).join(', ')}
              </h5>
            </div>)}
          />
          <Button size='icon' variant='outline' onClick={() => setOpenFilter(true)}>
            <SlidersVertical />
          </Button>
        </div>
        <div className="absolute bottom-18 right-3 flex flex-col gap-2 z-7">
          <div
            onClick={() => mapRef.current?.easeTo({ bearing: 0, pitch: 0 })}
            className="flex items-center justify-center 
           w-10 h-10 rounded-full shadow-lg border 
           bg-linear-to-b from-white to-gray-100 
           backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
            title="Klik untuk reset ke utara"
          >
            <div
              className="relative w-10 h-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `rotate(${-viewState.bearing}deg)` }}
            >
              {/* Jarum kompas */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-fit h-5">
                  {/* Segitiga atas (utara) */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[4px] border-l-transparent 
                     border-r-[4px] border-r-transparent 
                     border-b-10 border-b-red-600"
                  />
                  {/* Segitiga bawah (selatan) */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[4px] border-l-transparent 
                     border-r-[4px] border-r-transparent 
                     border-t-10 border-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          <GeolocateControl ref={geoRef} onGeolocate={handleOnGeoLocate} positionOptions={{ enableHighAccuracy: true }} />

          {/* Zoom Controls */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <Button
              onClick={geoLocateTrigger}
              variant='outline'
              title="Locate Me"
              size="icon-lg"
            >
              <LocateFixed size={24} />
            </Button>
            <Button
              onClick={handleZoomIn}
              variant='outline'
              title="Zoom In"
              size='icon-lg'
            >
              <Plus size={24} />
            </Button>
            <Button
              onClick={handleZoomOut}
              variant='outline'
              title="Zoom Out"
              size="icon-lg"
            >
              <Minus size={24} />
            </Button>
          </div>

          {/* Custom Buttons Below Geolocate */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" title="Map Styles">
                  <Layers />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" sideOffset={10} className="translate-y-[-5.7em] max-w-16 max-h-96 md:max-w-52 sm:max-h-fit sm:max-w-fit">
                <div className="flex flex-col gap-1 md:gap-3 items-center">
                  {MapStyles.map((item) => (
                    <div key={item.id}>
                      <div
                        onClick={() => handleChangeMapStyle(item)}
                        className={`hover:scale-105 transition p-5 rounded-md border cursor-pointer w-full ${item.id === mapStyle.id ? 'border-blue-500' : ''}`}
                        style={{
                          backgroundImage: `url(${item.preview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="flex text-center justify-center items-center">
                          <h5 className="hidden md:flex text-neutral-50 font-bold drop-shadow">{item.label}</h5>
                        </div>
                      </div>
                      <h5 className="text-sm text-center md:hidden text-black font-semibold drop-shadow">{item.abbrv}</h5>
                    </div>

                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => {
                const view = getViewFromMap(mapRef)
                if (view) refreshMap(view)
              }}
              variant='outline'
              title="Refresh"
            >
              <RotateCw size={18} />
            </Button>
          </div>
        </div>

        {DEV_MODE && <>
          <div className="absolute flex gap-2 bottom-8 right-2 z-10 text-sm p-2 rounded pointer-events-none">
            <p>Zoom: {viewState.zoom.toFixed(2)}</p>
            <p>Lng: {viewState.longitude.toFixed(5)}</p>
            <p>Lat: {viewState.latitude.toFixed(5)}</p>
            <p>Bearing: {viewState.bearing?.toFixed(2) ?? "0.00"}</p>
            <p>Pitch: {viewState.pitch?.toFixed(2) ?? "0.00"}</p>
          </div>
        </>}
        {markers}
      </Map>
    </div>

  )
}

export default MapDefault;