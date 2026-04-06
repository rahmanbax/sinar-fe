import { useState } from "react";
import { Map, type ViewState } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const center_indonesia_coord = {
    longitude: 118.0149,
    latitude: -2.5489,
}

const mapStyleUrl = 'https://api.maptiler.com/maps/streets-v4/style.json?key=LKoyDpZYXFZFev1xFoUc';

const MiniIndonesiaMap = () => {
    const initialViewState: ViewState = {
        longitude: center_indonesia_coord.longitude,
        latitude: center_indonesia_coord.latitude,
        zoom: 3.5,
        bearing: 0,
        pitch: 0,
        padding: { bottom: 0, top: 0, left: 0, right: 0 }
    };

    const [viewState, setViewState] = useState(initialViewState);

    return (
        <div className="w-full h-full overflow-hidden relative">
            <Map
                {...viewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyleUrl}
                onMove={e => setViewState(e.viewState)}
                maxBounds={[
                    [91, -12],
                    [142, 12]
                ]}
            />
        </div>
    )
}

export default MiniIndonesiaMap;
