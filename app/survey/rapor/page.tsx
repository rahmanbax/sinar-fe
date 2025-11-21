"use client"
import { useState, useRef, useEffect } from "react";
import { PiPencilSimpleLineDuotone } from 'react-icons/pi'

import { Button } from "@/components/ui/button";
import { ChevronsDown, ChevronsUp, CircleUserRound, Database } from "lucide-react";
import SurveyorLayout from "@/layouts/SurveryorLayout";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// import * as d3 from 'd3'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { Map, type MapRef, type ViewState, } from '@vis.gl/react-maplibre'
import { big_office_coord, MapStyles } from "@/components/map/Map";
import { IoLocationOutline } from "react-icons/io5";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import AutoComplete from "@/components/AutoComplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

const Page = () => {
  const [fullTab, setFulltab] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    if (!navbarRef.current) return;

    // Observe height changes of navbar
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setNavbarHeight(entry.contentRect.height);
      }
    });

    observer.observe(navbarRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <SurveyorLayout navbarRef={navbarRef}>
      <div
        className="flex flex-col grow overflow-hidden p-5 px-10"
        style={{ paddingTop: fullTab ? navbarHeight + 27 : 90 }}
      >
        <h3 className="text-xl font-semibold mb-8">PILIH WILAYAH ADMINISTRASI</h3>
        <div className="flex flex-col md:flex-row gap-x-5 gap-y-5">
          <div className="flex flex-col md:flex-row md:items-center gap-x-8 gap-y-5 grow w-full">
            <div className="shrink">
              <AutoComplete label="Provinsi" placeholder="Pilih Provinsi..." data={[]} value={1} onSelect={(v) => console.log(v)} />
            </div>
            <div className="shrink">
              <AutoComplete label="Kabupaten/Kota" placeholder="Kabupaten/Kota" data={[]} value={1} onSelect={(v) => console.log(v)} />
            </div>
            <div className="grow">
              <Label className="mb-3">Pilih Periode</Label>
              <FieldGroup className="flex flex-col sm:flex-row gap-y-2">
                <Field>
                  <Input
                    id="start_year"
                    name="start_year"
                    type="number"
                    required
                  />
                </Field>
                <FieldLabel htmlFor="generic_name" >
                  Sampai dengan
                </FieldLabel>
                <Field>
                  <Input
                    id="name_year"
                    name="name_year"
                    type="number"
                    required
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>
          <div className="flex gap-8 items-end">
            <Button className="bg-blue-600 hover:bg-blue-800 border">Proses</Button>
            <Button className="bg-green-600 hover:bg-green-800 border">Cetak</Button>
          </div>
        </div>
        <div className="flex">
          
        </div>
      </div>
    </SurveyorLayout>
  );
}

export default Page