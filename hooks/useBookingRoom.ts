import { Room } from '@prisma/client';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';


type RoomDataType = {
    room : Room;
    totalPrice : number;
    breakFastIncluded? : boolean;
    startDate : Date;
    endDate : Date;
}


interface BookRoomStore {
    bookingRoomData: RoomDataType | null;
    paymentIntentId : string | null;
    clientSecret : string | undefined;
    setRoomData : (data : RoomDataType) => void;
    setPaymentIntentId : (paymentIntent : string) => void;
    setClientSecret: (clientSecret : string) => void;
    resetBookRoom : () => void;
}

const useBookRoom = create<BookRoomStore>()(
  persist(
    (set)=>({
        bookingRoomData : null,
        paymentIntentId : null,
        clientSecret : undefined,
        setRoomData:(data : RoomDataType) => {
            set({bookingRoomData : data})
        },
        setPaymentIntentId : (paymentIntentId : string) => {
          set({paymentIntentId})
        },
        setClientSecret:(clientSecret : string) => {
          set({clientSecret})
        },
        resetBookRoom : () => {
          set({
              bookingRoomData : null,
              paymentIntentId : null,
              clientSecret : undefined
          })
        }
      
      }),{
        name : 'BookRoom',
      }
  )
    

);




export default useBookRoom;