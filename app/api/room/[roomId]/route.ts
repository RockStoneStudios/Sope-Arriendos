import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function PATCH(req:Request,{params} : {params:{roomId : string}}) {
      try{
          const body = await req.json();
          console.log(body);
          const {userId} = auth();
          if(!userId) return new NextResponse('Unauthorized',{status:401})
          
          if(!params.roomId) return new NextResponse('El Id es requerrido',{status :400});
            
          const room = await prismadb.room.update({
             where : {
                id : params.roomId
             },
             data : {...body}
          });
          return NextResponse.json(room);
        }catch(error){
        console.log('Error at /api/room Patch',error);
        return new NextResponse('Internal Server Error',{status : 500})
      }
}



export async function DELETE(req:Request,{params} : {params:{roomId : string}}) {
   try{
      
       const {userId} = auth();
       if(!userId) return new NextResponse('Unauthorized',{status:401})
       
       if(!params.roomId) return new NextResponse('El Id es requerrido',{status :400});
         
       const room = await prismadb.hotel.delete({
          where : {
             id : params.roomId
          },
          
       });
       return NextResponse.json(room);
     }catch(error){
     console.log('Error at /api/room Delete',error);
     return new NextResponse('Internal Server Error',{status : 500})
   }
}