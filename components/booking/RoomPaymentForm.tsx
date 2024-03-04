'use client';

import useBookRoom from "@/hooks/useBookingRoom";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Separator } from "@radix-ui/react-dropdown-menu";
import moment from 'moment';
import 'moment/locale/es'
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";
import { Booking } from "@prisma/client";
import { DateRange } from "react-day-picker";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";



interface RoomPaymentFormProps {
    clientSecret : string;
    handleSetPaymentSuccess : (value : boolean) => void;
}

type DateRangesType = {
   startDate : Date,
   endDate : Date
}

function hasOverLap(startDate:Date,endDate : Date,dateRanges :DateRangesType[]){
   const targetInterval = {start: startOfDay(new Date(startDate)),end : endOfDay(new Date(endDate))};

   for(const range of dateRanges) {
     const rangeStart = startOfDay(new Date(range.startDate));
     const rangeEnd = endOfDay(new Date(range.endDate));

     if(
         isWithinInterval(targetInterval.start,{start:rangeStart,end : rangeEnd})
      || isWithinInterval(targetInterval.end,{start: rangeStart,end: rangeEnd})
      || (targetInterval.start < rangeStart && targetInterval.end > rangeEnd)
      )
     {
       return true
     }
   }
   return false;
}

const RoomPaymentForm = ({clientSecret, handleSetPaymentSuccess}: RoomPaymentFormProps) => {
    const {bookingRoomData,resetBookRoom} = useBookRoom();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading,setIsLoading] = useState(false);
    const {toast} = useToast();
    const router = useRouter();

        useEffect(()=>{
            if(!stripe) return;
            if(!clientSecret){
                return;
            }
            handleSetPaymentSuccess(false);
            setIsLoading(false);
        },[stripe]);

    const handleSubmit = async(e:React.FormEvent) => {
          e.preventDefault();
          setIsLoading(true);
          if(!stripe || !elements || !bookingRoomData){
            return ;
          }
          try{
               //date overlaps
               const bookings = await axios.get(`/api/booking/${bookingRoomData.room.id}`);
               const roomBookingDates = bookings.data.map((booking:Booking) => {
                return {
                   startDate : booking.startDate,
                   endDate : booking.endDate
                }
               });

               const overloapFound = hasOverLap(bookingRoomData.startDate,bookingRoomData.endDate,roomBookingDates);
                if(overloapFound){
                  setIsLoading(false);
                  return toast({
                     variant : 'destructive',
                     description : 'Oops! Algunos dias que estas tratando de reservar, ya se encuentran reservados\n Por favor seleccione otros dias'
                  });
                }
            
               stripe.confirmPayment({elements,redirect: 'if_required'}).then((result)=>{
                
                 console.log(result);
                 console.log('mira aca',result.error);
                if(!result.error){
                     
                     console.log(result.paymentIntent.id);
                      axios.patch(`/api/booking/${result.paymentIntent.id}`).then((res)=>{
                          toast({
                            variant : 'success',
                            description : '✨​ Reservado Correctamente'
                          });
                          router.refresh();
                          resetBookRoom();
                          handleSetPaymentSuccess(true);
                          setIsLoading(false);
                      }).catch(error => {
                        console.log(error);
                        toast({
                          variant : 'destructive',
                          description : 'Algo salio mal'
                        });
                        setIsLoading(false);
                      })
                   }else {
                      setIsLoading(false);
                   }
               });
          }catch(error){
            console.log(error);
            setIsLoading(false);
          }
    }

    if(!bookingRoomData?.startDate || !bookingRoomData?.endDate) {
        return <div>Error : No hay fecha de reservas !!</div>
    }
    moment.locale('es');
    const startDate = moment(bookingRoomData?.startDate).locale('es').format('MMMM Do YYYY')
    const endDate = moment(bookingRoomData?.endDate).locale('es').format('MMMM Do YYYY')

    return (
     <form onSubmit={handleSubmit} id="payment-form">
       <h2 className="font-semibold mb-2 textlg">Direccion de Envio</h2>
       <AddressElement options={{
         mode : 'billing',
         allowedCountries: ['CO','US']
       }
       
       }/>
       <h2 className="font-semibold mt-4 mb-2 textlg">Informacion de Pago</h2>
       <PaymentElement id="payment-element" options={{layout : 'tabs'}} />
       <div className="flex flex-col gap-1">
         <Separator/>
         <div className="flex flex-col gap-1">
            <h2 className="font-semibold mb-1 text-lg">Resumen de Reservas</h2>
             <div>Entraras el {startDate} at 5pm</div>
             <div>Saldras el {endDate} at 5pm</div>
             
         </div>
         <Separator />
          <div className="font-bold text-lg mb-4">
            Precio Total: ${bookingRoomData?.totalPrice}
          </div>
       </div>
        
        {
              isLoading &&  <Alert className="bg-indigo-600 text-white">
                                <Terminal className="h-4 w-4 stroke-slate-50" />
                                     <AlertTitle>Procesando Pago ...</AlertTitle>
                                     <AlertDescription>
                                       Por favor permanezca en la pagina mientras procesamos tu pago
                                        
                                     </AlertDescription>
                                 </Alert>
                             }
       
       <Button disabled={isLoading}>{isLoading ? 'Procesando Pago ...' : 'Pagar Ahora'}</Button>
     </form>
   )
}

export default RoomPaymentForm;