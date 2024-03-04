import { Hotel } from '.prisma/client';
import { Booking, Room } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import AmenityItem from '../AmenityItem';
import { Bath, Bed, BedDouble, Loader, Loader2,  Pencil, Plus, Trash, Tv, Users, Wand2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddRoomForm from './AddRoomForm';
import axios from 'axios';
import { toast, useToast } from '../ui/use-toast';
import { DatePickerWithRange } from './DataRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInCalendarDays, eachDayOfInterval } from 'date-fns';
import { useAuth } from '@clerk/nextjs';
import useBookRoom from '@/hooks/useBookingRoom';


interface RoomCardProps {
    hotel?: Hotel &{
       rooms : Room[]
    };
    room : Room;
    bookings?:  Booking[];
}

const RoomCard = ({hotel,room,bookings = []}: RoomCardProps) => {
    const [isLoading,setIsLoading] = useState(false);
    const pathname = usePathname();
    const [open,setOpen] = useState(false);
    const {setRoomData,paymentIntentId,setClientSecret,setPaymentIntentId} = useBookRoom();
    const [date,setDate] = useState<DateRange | undefined>();
    const [bookingIsLoading,setBookingIsLoading] = useState(false);
    const [totalPrice,setTotalPrice] = useState(room.roomPrice);
    const [days,setDays] = useState(0);
    const router = useRouter();
    const {toast} = useToast();
    const {userId} = useAuth();
    const isHotelDetailsPage = pathname.includes('hotel-details');
    const isBookRoom = pathname.includes('book-room');
    

    useEffect(()=>{
         if(date && date.from && date.to){
          const dayCount = differenceInCalendarDays(date?.to,date?.from)
         setDays(dayCount);
        
         setTotalPrice(room.roomPrice);
         if(dayCount && room.roomPrice){
            setTotalPrice(dayCount*room.roomPrice);
         }
        
      }
    },[date,room.roomPrice])

    const handleDialogOpen = () => {
        setOpen(prev => !prev)
      }


      const handleRoomDelete = (room:Room) => {
        setIsLoading(true);
        const imageKey = room.image.substring(room.image.lastIndexOf('/')+1);
        axios.post('/api/uploadthing/delete',{imageKey}).then(()=>{
            axios.delete(`/api/room/${room.id}`).then(()=>{
                router.refresh();
                toast({
                     variant : 'success',
                     description : 'Habitacion borrada'
                });
                setIsLoading(false);
            }).catch(()=> {
                setIsLoading(false);
                toast({
                    variant : 'destructive',
                    description : 'Algo salio mal'
                });
            })
        }).catch(()=> {
            setIsLoading(false);
                toast({
                    variant : 'destructive',
                    description : 'Algo salio mal'
                });
        })
      }

      const handleBookRoom = () => {
        if(!userId) return toast({
               variant : 'destructive',
               description : 'Oops! asegurate de estar logueado'
        });
        if(!hotel?.userId) return toast({
            variant : 'destructive',
            description : 'Algo salio mal, refresca la pagina e intenta de nuevo!!'
        });
         if(date?.from && date?.to) {
             setBookingIsLoading(true);
             const bookingRoomData = {
                room,
                totalPrice,
                startDate : date.from,
                endDate : date.to
             }
             setRoomData(bookingRoomData);
             fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  booking: {
                    hotelOwnerId: hotel.userId,
                    hotelId: hotel.id,
                    roomId: room.id,
                    startDate: date.from,
                    endDate: date.to,
                    breakFastIncluded : false,
                    totalPrice: totalPrice
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
         }else {
            toast({
                variant : 'destructive',
                description : 'Oops! Seleccionar fecha'
            })
         }
      }

   const disabledDates = useMemo(()=>{
      let dates: Date[] = [];
      const roomBookins = bookings.filter(booking => booking.roomId === room.id && booking.paymentStatus );
      roomBookins.forEach(booking =>{
        const range = eachDayOfInterval({
          start : new Date(booking.startDate),
          end : new Date(booking.endDate)
        });
        dates = [...dates, ...range];
      })
      return dates;
   },[bookings])


  return (
    <Card>
      <CardHeader>
         <CardTitle>{room.title}</CardTitle>
         <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
           <div className='aspect-square overflow-hidden relative h-[200px]  rounded-lg'>
             <Image fill src={room.image} alt={room.title} className='object-cover'/>
           </div>
           <div className='grid grid-cols-2 gap-4 content-start text-sm'>
                <AmenityItem>
                     <Bed className='h-4 w-4'/>
                      {room.bedCount} Cama{'(s)'}
                </AmenityItem>
                <AmenityItem>
                     <Users className='h-4 w-4'/>
                      {room.bedCount} persona{'(s)'}
                </AmenityItem>
                <AmenityItem>
                     <Bath className='h-4 w-4'/>
                      {room.bedCount} Baño{'(s)'}
                </AmenityItem>
                 {!!room.kingBed  && <AmenityItem><BedDouble className='h-4 w-4' />{room.kingBed} Cama Principal</AmenityItem>}
                 {!!room.quuenBed && <AmenityItem><Bed className='h-4 w-4'/>{room.quuenBed} Camas Secundaria {'(s)'}</AmenityItem>}
                 {room.TV && <AmenityItem><Tv className='h-4 w-4' />Tv</AmenityItem>}
                 {room.fan && <AmenityItem><Tv className='h-4 w-4' />Ventilador </AmenityItem>}
                 {room.airCondition && <AmenityItem><Tv className='h-4 w-4' />Aire acondicionado </AmenityItem>}
                 {room.closet && <AmenityItem><Tv className='h-4 w-4' />Closet </AmenityItem>}
                 {room.balcony && <AmenityItem><Tv className='h-4 w-4' />Balcon</AmenityItem>}
                 {room.breakFastPrice && <AmenityItem><Tv className='h-4 w-4' />${room.breakFastPrice} </AmenityItem>}
           </div>
           <Separator/>
           <div className='flex gap-4 justify-between'>
              <div>Precio Habitacion <span>{room.roomPrice}</span>
               <span className='text-xs'> /(24 hrs)</span>
                {!!room.breakFastPrice && <div>Tiempo Libre Precio: <span className='font-bold'>${room.breakFastPrice}</span></div>}
              </div>
              
           </div>
              <Separator/>
      </CardContent>
        {!isBookRoom &&
           <CardFooter>

           {
               isHotelDetailsPage 
               ? 
               <div className='flex flex-col gap-6'>
                  <div className='mb-2'>
                    <div>Seleccionar dias</div>
                    <DatePickerWithRange date ={date} setDate={setDate} disabledDates = {disabledDates}/>
                  </div>
                   
                  <div>Precio Total : <span className='font-bold'>${totalPrice} para <span className='font-semibold'>{days} dias</span></span></div>
                  <Button
                   onClick={()=> handleBookRoom()}
                  disabled={bookingIsLoading} type='button'>
                   {bookingIsLoading? <Loader2 className='mr-2 h-4 w-4'/> : <Wand2 className='mr-2 h-4 w-4'/>}
                   {bookingIsLoading ? 'Loading...' : 'Reservas'}
                  </Button>
               </div> 
               : 
               <div className='flex w-full justify-between'>
               <Button 
               onClick={()=> handleRoomDelete(room)}
               disabled={isLoading} type='button' variant='ghost'>
                   {isLoading ? <><Loader2 className='mr-2 h-4 w-4' />Borrando ...</>
                   : <><Trash className='mr-2 h-4 w-4'/>Borrar</>    
               }
               </Button>
               <Dialog open={open} onOpenChange={setOpen}>
                   <DialogTrigger>
                       <Button 
                           className="max-w-[200px]"
                       type='button' variant='outline'>
                           <Pencil className="mr-2 h-4 w-4" />
                           Actualizar
                           </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-[900px] w-[90%]">
                           <DialogHeader className="px-2">
                           <DialogTitle>Actualizar Habitacion</DialogTitle>
                           <DialogDescription>
                               Hacer cambios en esta habitacion                                          </DialogDescription>
                           </DialogHeader>
                           <AddRoomForm hotel={hotel} room={room} handleDialogOpen={handleDialogOpen}/>
                       </DialogContent>
                   </Dialog>
                   
               </div>
           }
           </CardFooter>
      }
       


    </Card>
  )
}

export default RoomCard