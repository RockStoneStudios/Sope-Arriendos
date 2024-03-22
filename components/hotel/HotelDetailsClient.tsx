'use client';

import { Booking } from "@prisma/client";
import { HotelWithRooms } from "./AddHotelForm";
import useLocation from "@/hooks/useLocation";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { Dumbbell, MapPin , Bath, Beer} from "lucide-react";
import {FaParking, FaSwimmer, FaVolleyballBall, FaWifi} from 'react-icons/fa';
import { MdOutdoorGrill } from "react-icons/md";
import { GiPoolTableCorner } from "react-icons/gi";
import { TiWeatherWindyCloudy } from "react-icons/ti";
import RoomCard from "../room/RoomCard";
import { Separator } from "../ui/separator";
import MapBox from "../map/MapBox";
import React, { useEffect } from "react";

const HotelDetailsClient = ({hotel,bookings} : {hotel : HotelWithRooms,bookings?: Booking[]}) => {
   const {getCountryByCode,getStateByCode} = useLocation();
   const  country = getCountryByCode(hotel.country);
   const state = getStateByCode(hotel.country,hotel.state);
   const [mapRendered, setMapRendered] = React.useState(false); // Agregar estado para rastrear la renderización del mapa


   useEffect(() => {
      setMapRendered(true); // Actualizar mapRendered a true después de la renderización inicial
    }, []); // El segundo argumento [] indica que useEffect se ejecutará solo una vez después de la primera renderización
  
   


   return (
      <div className="flex flex-col gap-6 pb-2">
          <div className="aspect-square overflow-hidden relative w-full h-[250px] md:h-[380px] rounded-lg">
             <Image
              fill
              src={hotel.image}
              alt={hotel.title}
              className="object-cover"
             />
          </div>
          <div>
             <h3 className="font-semibold text-xl md:text-3xl">{hotel.title}</h3>
              <div className="font-semibold mt-4">
                 <AmenityItem><MapPin className="h-4 w-4"/>{country?.name} {state?.name} , {hotel.city}</AmenityItem>
              </div>
              
               <h3 className="font-semibold text-lg mt-4 mb-4">Detalle de Direccion</h3>
               <p className="text-primary/90 mb-2">{hotel.locationDescription}</p>
               <Separator/>
               <h3 className="font-semibold text-lg mt-4 mb-4">Acerca de la propiedad</h3>
               <p className="text-primary/90 mb-2">{hotel.description}</p>
               <Separator/>
               <h3 className="mt-2">Comodidades de la Propiedad</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-start text-sm mt-4">
                    {hotel.swimmingPool && <AmenityItem><FaSwimmer size={25} />Piscina</AmenityItem>}
                    {hotel.wifi && <AmenityItem><FaWifi  size={25}/>WiFi</AmenityItem>}
                    {hotel.gym && <AmenityItem><Dumbbell className="h-6 w-6" />Gimnasio</AmenityItem>}
                    {hotel.jacuzzi && <AmenityItem><Bath className="h-6 w-6"/>Jacuzzi</AmenityItem>}
                    {hotel.sports_scene && <AmenityItem><FaVolleyballBall size={25} />Cancha</AmenityItem>}
                    {hotel.grillRoast && <AmenityItem><MdOutdoorGrill size={25}/>Asador</AmenityItem>}
                    {hotel.freeParking && <AmenityItem><FaParking size={25} /> Parqueadero</AmenityItem>}
                    {hotel.poolTable && <AmenityItem><GiPoolTableCorner size={25} />Mesa Billar</AmenityItem>}
                    {hotel.bar && <AmenityItem><Beer className="h-6 w-6" />Bar</AmenityItem>}
                    {hotel.turco && <AmenityItem><TiWeatherWindyCloudy size={25}/>Turco</AmenityItem>}
               </div>

         
          </div>
          <div>
             {!!hotel.rooms.length && <div>
              <h3 className="text-lg font-semibold my-4">Hotel Rooms</h3>   
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hotel.rooms.map((room)=> (
                     <RoomCard hotel={hotel} room={room} key={room.id} bookings={bookings} />
                  ))}
               </div>
            </div>}
          </div>
         {!mapRendered && ( // Renderizar el mapa condicionalmente
          <MapBox /> // Pasar devolución de llamada para establecer mapRendered
        )}
      </div>
   )
}
export default HotelDetailsClient;