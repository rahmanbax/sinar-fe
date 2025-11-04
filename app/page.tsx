"use client"

import Image from "next/image";
import { Button } from '@/components/ui/button'
import PublicLayout from "./layouts/PublicLayout";
import MapDefault, { big_office_coord } from "@/components/map/Map";

import { useGeolocated } from "react-geolocated";
import { useEffect, useState } from "react";

export default function Home() {
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition,  } =
      useGeolocated({
          positionOptions: {
              enableHighAccuracy: true,
          },
          userDecisionTimeout: 10000,
          watchPosition: true,
      });

  return (
    <PublicLayout>
      <MapDefault initialLocation={coords}/>
    </PublicLayout>
    
  );
}
