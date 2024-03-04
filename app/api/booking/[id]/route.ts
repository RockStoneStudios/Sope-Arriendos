import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req:Request,{params} : {params:{id : string}}) {
    try{
        console.log('entre');
        console.log('hello',params.id);
        const {userId} = auth();
        if(!userId) return new NextResponse('Unauthorized',{status:401})
        
        if(!params.id) return new NextResponse('El Id del Pago es requerido',{status :400});
          
        const booking = await prismadb.booking.update({
           where : {
              paymentIntentId : params.id
           },
           data : {paymentStatus : true}
        });
        return NextResponse.json(booking);
      }catch(error){
      console.log('Error at /api/booking/Id Patch',error);
      return new NextResponse('Internal Server Error',{status : 500})
    }
}



export async function GET(req:Request,{params} : {params:{id : string}}) {
    try{
       
        const {userId} = auth();
        if(!userId) return new NextResponse('Unauthorized',{status:401})
        
        if(!params.id) return new NextResponse('Id de Hotel es requerido',{status :400});
          
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const bookings = await prismadb.booking.findMany({
           where : {
            paymentStatus:true,
              roomId : params.id,
              endDate : {
               gt : yesterday
              }
           },
           
        });
        return NextResponse.json(bookings);
      }catch(error){
      console.log('Error at /api/booking GET',error);
      return new NextResponse('Internal Server Error',{status : 500})
    }
 }


