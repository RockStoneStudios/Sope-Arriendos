import { getBookings } from "@/actions/getBookings";
import { getHotelById } from "@/actions/getHotelById";
import HotelDetailsClient from "@/components/hotel/HotelDetailsClient";

interface HotelDetailProps {
    params : {
        hotelId : string;
    }
}

const HotelDetails = async ({params} : HotelDetailProps) => {
    const hotel = await getHotelById(params.hotelId);
    const bookings = await getBookings(hotel?.id as string);
    if(!hotel) return <div>Opps! Hotel no encontrado</div>

   return (
      <div>
        <HotelDetailsClient hotel = {hotel} bookings={bookings}/>
      </div>
   )
}

export default HotelDetails;