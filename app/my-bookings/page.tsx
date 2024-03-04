import { getBookingsByHotelOwnerId } from '@/actions/getBookingsByHotelOwnerId';
import { getBookingsByUserId } from '@/actions/getBookingsByUserId';
import MyBookingClient from '@/components/booking/MyBookingsClient';

import React from 'react'

 const MyBookings = async () => {
    const bookingsFromVisitor = await getBookingsByHotelOwnerId();
    const bookingsIHaveMade = await getBookingsByUserId();

  return (
    <div className='flex flex-col gap-10'>
      {!!bookingsIHaveMade?.length && <div>
       <h2 className='text-xl md:text-2xl font-semibold mb-6 mt-2'>Reservas que has hecho</h2>   
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
         {bookingsIHaveMade.map(booking => <MyBookingClient key={booking.id} booking={booking} />)}
      </div>
     </div>}
     {!!bookingsFromVisitor?.length && <div>
       <h2 className='text-xl md:text-2xl font-semibold mb-6 mt-2'>Reservas que ha tenido tu propiedad</h2>   
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
         {bookingsFromVisitor.map(booking => <MyBookingClient key={booking.id} booking={booking} />)}
      </div>
     </div>}
 
    </div>
  )
}

export default MyBookings;
