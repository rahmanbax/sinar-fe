/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import {useState, useEffect, useRef} from 'react';
import {Map, Marker, GeolocateControl, GeolocateResultEvent} from '@vis.gl/react-maplibre'
import { FaLocationDot } from 'react-icons/fa6'

import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE_SRC = 'https://api.maptiler.com/maps/streets-v4/style.json?key=LKoyDpZYXFZFev1xFoUc'

export const big_office_coord = {
    longitude: 106.8467944,
    latitude: -6.4908661,
}


interface ILabeledMarker {
  longitude: number
  latitude: number
  label: string
}

const LabeledMarker :React.FC<ILabeledMarker> = ({longitude, latitude, label}) => {
  return (
    <Marker 
      pitchAlignment='map'
      anchor='center'
      latitude={latitude} longitude={longitude}
      className='hover:cursor-pointer'
    >
      <FaLocationDot className='text-2xl text-red-500 hover:ring-2 hover:ring-cyan-400 hover:rounded-full'/>
      <div className='bg-neutral-50 py-1 px-2 rounded-sm border whitespace-nowrap transform -translate-x-6 translate-y-1'>
        {label}
      </div>
    </Marker>
  )
}

interface IMapDefault {
    initialLocation?: {
        longitude: number,
        latitude: number,
    }
}

const MapDefault : React.FC<IMapDefault> = ({initialLocation}) => {

    const myCoord = initialLocation ?? big_office_coord;

    const initialViewState = {
        ...myCoord,
        zoom: 31.5,
        bearing: 0,
        pitch: 0
    };

    const [viewState, setViewState] = useState(initialViewState);
    
    const handleOnGeoLocate = (e: GeolocateResultEvent) => {
      setViewState((prev) => ({
        ...prev,
        longitude: e.coords.longitude,
        latitude: e.coords.latitude,
      }));
    }

    useEffect(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        setViewState((prev) => ({
          ...prev,
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        }));
      })
    }, [initialLocation]);

    return (
        <div className='flex justify-center min-w-[95vw]'>
          <Map
              initialViewState={viewState}
              style={{width: '100vw', height: '85vh'}}
              mapStyle={MAP_STYLE_SRC}
            > 
            <LabeledMarker latitude={big_office_coord.latitude} longitude={big_office_coord.longitude} label='Kantor BIG'/>
            <GeolocateControl onGeolocate={handleOnGeoLocate}/>
          </Map>
        </div>
       
    )
}

export default MapDefault;