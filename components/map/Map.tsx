"use client"

import { useState, useEffect, useRef } from 'react';
import { Map, Marker, GeolocateControl, GeolocateResultEvent, type MapRef, type ViewState, NavigationControl } from '@vis.gl/react-maplibre'
import { IoLocationSharp, IoLocationOutline } from 'react-icons/io5'
import { DEV_MODE } from '@/lib/config';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Minus, Plus, LocateFixed, Layers, Download, Search, SlidersVertical, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { NRB } from '@/types';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { motion } from 'framer-motion'

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
  dataId: string
  longitude: number
  latitude: number
  label: string
  handleMouseEnter: (dataId: string) => void
  handleMouseLeave: () => void
  hovered: boolean
  handleOnClick: (dataId: string) => void
  selected: boolean
}

const LabeledMarker: React.FC<ILabeledMarker> = ({ dataId, longitude, latitude, label, handleMouseEnter, handleMouseLeave, hovered, handleOnClick, selected }) => {
  const isActive = hovered || selected

  return (
    <Marker
      pitchAlignment='map'
      anchor='center'
      latitude={latitude} longitude={longitude}
      className='hover:cursor-pointer'
      onClick={() => handleOnClick(dataId)}
    >
      <motion.div
        className="relative flex flex-col items-center cursor-pointer"
        onMouseEnter={() => handleMouseEnter(dataId)}
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
  geoLocation?: GeolocationCoordinates
  dataId: string | null
  setDataId: (dataId: string | null) => void
  data?: NRB[]
  setOpenFilter: (open: boolean) => void
  setSearchString: (search: string) => void
  loading: boolean
}
/*
Usage:
<MapLibreZoomToggle />
- Requires @vis.gl/react-maplibre
- Tailwind used for styling
- Supports zooming, reset view, and toggle UI visibility
*/
const MapDefault: React.FC<IMapDefault> = ({ geoLocation, data, dataId, setDataId, setOpenFilter, setSearchString, loading }) => {
  const mapRef = useRef<MapRef>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoRef = useRef<maplibregl.GeolocateControl>(null);

  const [bearing, setBearing] = useState(0)

  const initialViewState: ViewState = {
    longitude: geoLocation?.longitude ?? 119.450,
    latitude: geoLocation?.longitude ?? -6.900,
    zoom: 4.55,
    bearing: 0,
    pitch: 0,
    padding: { bottom: 0 }
  };

  const [loadingStyle, setLoadingStyle] = useState(false)
  const [viewState, setViewState] = useState(initialViewState);
  const [mapStyle, setMapStyle] = useState(MapStyles[0])
  const [onHover, setOnHover] = useState<string | undefined>()

  const handleOnGeoLocate = (e: GeolocateResultEvent) => {
    const coords = e.coords;
    mapRef.current?.flyTo({
      center: [coords.longitude, coords.latitude],
      zoom: 10,
      essential: true,
    });
  }

  const geoLocateTrigger = () => {
    geoRef.current?.trigger()
  }

  const handleZoomIn = () => setViewState((v) => ({ ...v, zoom: v.zoom + 0.1 }));
  const handleZoomOut = () => setViewState((v) => ({ ...v, zoom: Math.max(v.zoom - 0.1, 0) }));

  const handleMarkerOnClick = (dataId: string | null) => {
    setDataId(dataId)
    const poi = data?.find(i => i.id === dataId)
    if (poi) mapRef.current?.flyTo({
      center: [poi.coord.longitude, poi.coord.latitude],
      zoom: 15,
      essential: true,
    });
  }

  const handleChangeMapStyle = (style: typeof mapStyle) => {
    if (style.id !== mapStyle.id) {
      setLoadingStyle(true)
      setMapStyle(style)
    }
  }

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

  const handleRotation = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const updateBearing = () => {
      setBearing(map.getBearing());
    };

    updateBearing(); // set awal
    map.on("rotate", updateBearing);
    map.on("pitch", updateBearing);

    return () => {
      map.off("rotate", updateBearing);
      map.off("pitch", updateBearing);
    };
  }

  useEffect(handleLoadMapStyle, [mapStyle])

  useEffect(handleRotation, []);

  return (
    <div className='flex justify-center min-w-[95vw] min-h-screen'>
      {loadingStyle && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
          <Loader2 className="animate-spin mb-2 w-10 h-10" />
          <p className="text-sm font-medium">Loading map style...</p>
        </div>
      )}
      <Map
        {...viewState}
        ref={mapRef}
        style={{ width: '100vw', height: 'max' }}
        mapStyle={mapStyle.src ?? MAP_STYLE_SRC}
        onMove={e => {
          setViewState(e.viewState)
          setBearing(e.viewState.bearing)
        }}
        maxBounds={[
          [91, -12],   // Sudut barat daya Indonesia (lon, lat) + 5
          [142, 12]     // Sudut timur laut Indonesia (lon, lat) + 5
        ]}
      >

        {DEV_MODE && <>

          <div className='absolute bottom-120 right-2 flex flex-col gap-2 z-10'>
            <h5 className='text-md'>accuracy: {geoLocation?.accuracy?.toFixed(3)}</h5>
            <h5 className='text-md'>Longitude: {geoLocation?.longitude?.toFixed(3)}</h5>
            <h5 className='text-md'>Latitude: {geoLocation?.latitude?.toFixed(3)}</h5>
            <h5 className='text-md'>altitudeAccuracy: {geoLocation?.altitudeAccuracy?.toFixed(3)}</h5>
            <h5 className='text-md'>Heading: {geoLocation?.heading?.toFixed(3)}</h5>
            <h5 className='text-md'>Speed: {geoLocation?.speed?.toFixed(3)}</h5>
          </div>
          <div className='absolute bottom-80 right-2 flex flex-col gap-2 z-10'>
            <h5 className='text-md'>Zoom: {viewState.zoom.toFixed(3)}</h5>
            <h5 className='text-md'>Longitude: {viewState.longitude?.toFixed(3)}</h5>
            <h5 className='text-md'>Latitude: {viewState.latitude?.toFixed(3)}</h5>
            <h5 className='text-md'>Bearing: {viewState.bearing?.toFixed(3)}</h5>
            <h5 className='text-md'>Pitch: {viewState.pitch?.toFixed(3)}</h5>
          </div>
        </>}

        <div className="w-[90vw] absolute top-25 sm:top-22 left-1/2 -translate-x-1/2 z-3 flex gap-2 sm:left-5 sm:translate-x-0 sm:w-[50vw] md:w-[40vw] lg:w-96">
          <InputGroup className='bg-neutral-50'>
            <InputGroupInput placeholder="Search..." onChange={(e) => setSearchString(e.target.value)} />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <Button size='icon' variant='outline' onClick={() => setOpenFilter(true)}>
            <SlidersVertical />
          </Button>
        </div>
        <div className="absolute bottom-12 right-3 flex flex-col gap-2 z-7">
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
            style={{ transform: `rotate(${-bearing}deg)` }}
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
                    <>
                      <div
                        key={item.id}
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
                    </>

                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => alert("Refresh clicked")}
              variant='outline'
              title="Refresh"
            >
              <Download size={18} />
            </Button>
          </div>
        </div>
        {data && data.length
          && data.map(d => (
            <LabeledMarker
              key={d.id}
              dataId={d.id}
              latitude={d.coord.latitude}
              longitude={d.coord.longitude}
              label={d.nrb}
              handleOnClick={handleMarkerOnClick}
              selected={dataId === d.id}
              handleMouseEnter={() => setOnHover(d.id)}
              handleMouseLeave={() => setOnHover(undefined)}
              hovered={onHover === d.id}
            />
          ))}
      </Map>
    </div>

  )
}

export default MapDefault;