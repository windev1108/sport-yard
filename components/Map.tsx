import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, Popup } from 'react-leaflet'
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Pitch } from '../Models';
import instance from '../server/db/instance';


const icon = L.icon({
    iconAnchor: require("../assets/images/marker.png"),
    iconUrl: require("../assets/images/marker.png"),
    iconSize: [38, 38],
});

interface MapProps {
    pitchId: string
}


const Map: NextPage<MapProps> = ({ pitchId }) => {
    const [pitch, setPitch] = useState<Pitch | any>({})
    const { coordinates } = pitch
    const position: L.LatLngExpression | undefined = [coordinates?.latitude, coordinates?.longitude]

    useEffect(() => {
        pitchId && instance.get(`/pitch/${pitchId}`)
            .then(res => setPitch(res.data))
    }, [pitchId])

    return (
        (position[0] && pitch.id &&
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
                    attribution='Map data &copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors, <a href=&quot;https://creativecommons.org/licenses/by-sa/2.0/&quot;>CC-BY-SA</a>, Imagery &copy; <a href=&quot;https://www.mapbox.com/&quot;>Mapbox</a>'
                />
                <Marker position={position} draggable={true} >
                    <Popup>{pitch.name}</Popup>
                </Marker>
            </MapContainer>
        )
    )
}

export default Map