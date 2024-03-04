'use client';
import { Hotel } from '.prisma/client';
import { Booking, Room } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import AmenityItem from '../AmenityItem';
import { Bath, Bed, BedDouble, Loader, MapPin, Tv, Users, Wand2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast, useToast } from '../ui/use-toast';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { useAuth } from '@clerk/nextjs';
import useBookRoom from '@/hooks/useBookingRoom';
import React from 'react';
import useLocation from '@/hooks/useLocation';
import moment from 'moment';


interface MyBookingClientProps {
    booking : Booking & {Room:Room | null} & {Hotel : Hotel | null}
}

const MyBookingClient : React.FC<MyBookingClientProps> = ({booking}) => {
    const {setRoomData,paymentIntentId,setClientSecret,setPaymentIntentId} = useBookRoom();
    const [bookingIsLoading,setBookingIsLoading] = useState(false);
    const {getCountryByCode,getStateByCode} = useLocation();
    const {userId} = useAuth();
    const router = useRouter();
    const {Hotel,Room} = booking;

    if(!Hotel || !Room) return <div>No hay Datos!!</div>

    const country = getCountryByCode(Hotel.country);
    const state =  getStateByCode(Hotel.country,Hotel.state);
    const startDate = moment(booking.startDate).format('MMMM Do YYYY');
    const endDate = moment(booking.endDate).format('MMMM Do YYYY');
    const dayCount = differenceInCalendarDays(
        booking.endDate,
        booking.startDate
    );
    const {toast} = useToast();



     

      const handleBookRoom = () => {
        if(!userId) return toast({
               variant : 'destructive',
               description : 'Oops! asegurate de estar logueado'
        });
        if(!Hotel?.userId) return toast({
            variant : 'destructive',
            description : 'Algo salio mal, refresca la pagina e intenta de nuevo!!'
        });
         
             setBookingIsLoading(true);
             const bookingRoomData = {
                room :Room,
                totalPrice : booking.totalPrice,
                startDate : booking.startDate,
                endDate : booking.endDate
             }
             setRoomData(bookingRoomData);
             fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  booking: {
                    hotelOwnerId: Hotel.userId,
                    hotelId: Hotel.id,
                    roomId: Room.id,
                    startDate: bookingRoomData.startDate,
                    endDate: bookingRoomData.endDate,
                    breakFastIncluded : false,
                    totalPrice: bookingRoomData.totalPrice
                  },
                  payment_inten_id: paymentIntentId
                })
              })
              .then(res => {
                setBookingIsLoading(false);
                if (res.status === 401) {
                  return router.push('/login');
                }
                return res.json(); // Asumiendo que la respuesta es JSON válido
              })
              .then((data) => {
                console.log(data);
                setClientSecret(data.client_secret);
                setPaymentIntentId(data.id);
                router.push('/book-room');
              })
              .catch(error => {
                console.log('Error:', error);
                toast({
                  variant: 'destructive',
                  description: `Error! ${error.message}`
                });
              });
         }

      

  

  return (
    <Card>
      <CardHeader>
         <CardTitle>{Hotel.title}</CardTitle>
         <CardDescription>
           <div className='font-semibold mt-4'>
             <AmenityItem><MapPin className='h-4 w-4' /> {country?.name},
              {state?.name}, {Hotel.city}

             </AmenityItem>
           </div>
           <p className='py-2'>{Hotel.description}</p>
         </CardDescription>
          <Separator/>
         <CardTitle>{Room.title}</CardTitle>
         <CardDescription>{Room.description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
           <div className='aspect-square overflow-hidden relative h-[200px]  rounded-lg'>
             <Image fill src={Room.image} alt={Room.title} className='object-cover'/>
           </div>
           <div className='grid grid-cols-2 gap-4 content-start text-sm'>
                <AmenityItem>
                     <Bed className='h-4 w-4'/>
                      {Room.bedCount} Cama{'(s)'}
                </AmenityItem>
                <AmenityItem>
                     <Users className='h-4 w-4'/>
                      {Room.bedCount} persona{'(s)'}
                </AmenityItem>
                <AmenityItem>
                     <Bath className='h-4 w-4'/>
                      {Room.bedCount} Baño{'(s)'}
                </AmenityItem>
                 {!!Room.kingBed  && <AmenityItem><BedDouble className='h-4 w-4' />{Room.kingBed} Cama Principal</AmenityItem>}
                 {!!Room.quuenBed && <AmenityItem><Bed className='h-4 w-4'/>{Room.quuenBed} Camas Secundaria {'(s)'}</AmenityItem>}
                 {Room.TV && <AmenityItem><Tv className='h-4 w-4' />Tv</AmenityItem>}
                 {Room.fan && <AmenityItem><Tv className='h-4 w-4' />Ventilador </AmenityItem>}
                 {Room.airCondition && <AmenityItem><Tv className='h-4 w-4' />Aire acondicionado </AmenityItem>}
                 {Room.closet && <AmenityItem><Tv className='h-4 w-4' />Closet </AmenityItem>}
                 {Room.balcony && <AmenityItem><Tv className='h-4 w-4' />Balcon</AmenityItem>}
                 {Room.breakFastPrice && <AmenityItem><Tv className='h-4 w-4' />${Room.breakFastPrice} </AmenityItem>}
           </div>
           <Separator/>
           <div className='flex gap-4 justify-between'>
              <div>Precio Habitacion <span>{Room.roomPrice}</span>
               <span className='text-xs'> /(24 hrs)</span>
                {!!Room.breakFastPrice && <div>Tiempo Libre Precio: <span className='font-bold'>${Room.breakFastPrice}</span></div>}
              </div>
              
           </div>
          <Separator/>

          <div className='flex flex-col gap-2'>
            <CardTitle>Detalles de la Reserva</CardTitle>
             <div>Habitacion reservada por {booking.userName} por {dayCount} {moment(booking.bookedAt).fromNow()}</div>
             <div>Entrada : {startDate} a las 5PM</div>
             <div>Salida : {endDate} a las 5PM</div>
             {booking.paymentStatus ? <div className='text-teal-500'>Paga!! ${booking.totalPrice}</div>
              : <div className='text-rose-600'>No Pago!! ${booking.totalPrice} - No Reservado!!</div> 
            }
          </div>
      </CardContent>
     
      <CardFooter className='flex items-center justify-evenly'>
         <Button
          disabled={bookingIsLoading}
           variant='outline' 
          onClick={()=> router.push(`/hotels-details/${Hotel.id}`)}
         >Ver Hotel</Button>
         {!booking.paymentStatus && booking.userId == userId && 
         <Button 
         onClick={()=> handleBookRoom()}
          disabled={bookingIsLoading}
          >Pagar Ahora</Button>
         }

      </CardFooter>

    </Card>
  )
}


export default MyBookingClient;