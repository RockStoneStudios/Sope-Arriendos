import { getHotelByUserId } from "@/actions/getHotelsById";
import HotelList from "@/components/hotel/HotelList";


const MyHotels =async  () => {
    const hotels = await getHotelByUserId();
    if(!hotels) return <div>No Hotels found!!</div>
  return (
    <div>
      <h2 className="text-2xl font-semibold">Aqui mis propiedades</h2>
      <HotelList hotels={hotels} />
    </div>
  )
}

export default MyHotels;