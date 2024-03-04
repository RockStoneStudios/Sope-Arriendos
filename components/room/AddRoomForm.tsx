'use client';

import { Hotel, Room } from ".prisma/client";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast, useToast } from "../ui/use-toast";
import { Loader2, Pencil, PencilLine, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UploadButton } from "../uploadthing";

interface AddRoomFormProps {
    hotel?: Hotel & {
        rooms : Room[]
    }
    room? : Room
    handleDialogOpen : () => void;
}

const formSchema = z.object({
  title : z.string().min(3,{
     message : 'Ingresa nombre de la habitacion'
  }),
  description : z.string().min(10,{
    message : 'Describe la habitacion'
 }),
  bedCount : z.coerce.number().min(1,{message : 'Numero de camas requeridos'}).optional(),
  guestCount : z.coerce.number().min(1,{message : 'Ingresa el numero de personas por habitacion'}),
  bathRoomCount : z.coerce.number().min(0,{message : 'Baños por habitacion' }),
  kingBed : z.coerce.number().min(0),
  quuenBed : z.coerce.number().min(0),
  image : z.string().min(0,{message : 'Image is required'}),
  breakFastPrice : z.coerce.number().optional(),
  roomPrice : z.coerce.number().optional(),
  TV : z.boolean().optional(),
  balcony : z.boolean().optional(),
  airCondition : z.boolean().optional(),
  fan : z.boolean().optional(),
  closet : z.boolean().optional()

})

const AddRoomForm = ({hotel, room,handleDialogOpen}: AddRoomFormProps) => {
     const [image,setImage] = useState<string | undefined>(room?.image);
     const [imageIsDeleting,setImageIsDeleting] = useState(false);
     const [isLoading,setIsLoading] = useState(false);
     const router = useRouter();
     const {toast} = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : room || {
            title : '',
            description : '',
            bedCount : 1,
            guestCount : 1,
            bathRoomCount : 0,
            kingBed : 0,
            quuenBed : 0,
            image : '',
            breakFastPrice : 0,
            roomPrice : 0,
            TV : false,
            balcony : false,
            airCondition : false,
            fan : false,
            closet : false
            
        }
    });

    useEffect(()=>{
      if(typeof image === 'string'){
          form.setValue('image',image,{
              shouldValidate: true,
              shouldDirty : true,
              shouldTouch : true
          })
      }
   },[image])

    const handleImageDelete = (image:string) => {
      setImageIsDeleting(true);
      const imageKey = image.substring(image.lastIndexOf('/') +1 );
       
      axios.post('/api/uploadthing/delete',{imageKey}).then((res) =>{
        if(res.data.success) {
           setImage('');
           toast({
               variant : 'success',
               description : 'Propiedad removida'
           });
           router.push('/hotel/new');
        }
      }).catch(()=> {
       toast({
           variant : 'destructive',
           description : 'Algo salio mal !!'
       });              
      }).finally(()=>{
       setImageIsDeleting(false);
      })
 }

 function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true);
  if(hotel && room){
 
     axios.patch(`/api/room/${room.id}`,values).then((res)=>{
         toast({variant : 'success',description: 'Habitacion Actualizada'});
         router.refresh();
         setIsLoading(false);
         handleDialogOpen();
     }).catch((error)=>{
         console.log(error);
         toast({
             variant : 'destructive',
             description : 'Algo salio Mal'
         });

         setIsLoading(false);
     })
  }else {
    if(!hotel?.id) return;
     axios.post('/api/room',{...values, hotelId : hotel.id}).then((res)=> {
         toast({
             variant : 'success',
             description : 'Habitacion Creada !!'
         });
         router.refresh();
         setIsLoading(false);
         handleDialogOpen()
     }).catch((error) =>{
         console.log(error);
         toast({
             variant : 'destructive',
             description : 'Algo salio Mal'
         });
         setIsLoading(false);
     })
  }
 
}

  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form  {...form}>
        <form className="space-y-6">
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Habitacion</FormLabel>
              <FormDescription>Proveenos el nombre de la Habitacion</FormDescription>
              <FormControl>
                <Input placeholder="ejem : Habitacion principal" {...field} />
                  </FormControl>
                  <FormMessage />
                    </FormItem>
                   )}
          />
           <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Descripcion Habitacion</FormLabel>
                <FormDescription>Danos una descripcion de la habitación</FormDescription>
                <FormControl>
                  <Textarea placeholder="ejem : Habitacion amplia y comoda" {...field} />
                    </FormControl>
                    <FormMessage />
                      </FormItem>
                    )}
            />
            <div>
               <FormLabel>Servicios de la Habitacion</FormLabel>
               <FormDescription>Que hace unica esta habitacion ??</FormDescription>
               <div className="grid grid-cols-2 gap-2 mt-2">
              
                   <FormField
                    control={form.control}
                    name="TV"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>TV cable</FormLabel>
                        <FormMessage />
                    </FormItem>
                      )}
                  />
                  
                 
                   <FormField
                    control={form.control}
                    name="fan"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>Ventilador</FormLabel>
                        <FormMessage />
                    </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="airCondition"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>Aire acondicionado</FormLabel>
                        <FormMessage />
                    </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="closet"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>Closet</FormLabel>
                        <FormMessage />
                    </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="balcony"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>Balcon</FormLabel>
                        <FormMessage />
                    </FormItem>
                      )}
                  />


               </div>
            </div>
            <FormField
                       control={form.control}
                       name="image"
                       render={({field}) => (
                          <FormItem className="flex flex-1 flex-col gap-6">
                             <FormLabel>Subir una Imagen *</FormLabel>
                             <FormDescription>Escoge una imagen que describa esta habitacion </FormDescription>
                             <FormControl>
                                 {image ? 
                                 <>
                                  <div className="relative max-w-[4000px] min-w-[200px] max-h-[4000px] min-h-[200px] mt-4">
                                   <Image  fill src={image} alt="Propiedad Image" className="object-contain"/>
                                   <Button
                                    onClick={()=> handleImageDelete(image)}
                                   type="button" size="icon" variant="ghost" className="absolute right-[-12px] top-0">
                                      {imageIsDeleting ? <Loader2/> : <XCircle/>}
                                   </Button>
                                  </div>
                                 </> :
                                  <>
                                  <div className="flex flex-col items-center max-w-[4000px] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
                                    <UploadButton
                                            endpoint="imageUploader"
                                            onClientUploadComplete={(res) => {
                                            // Do something with the response
                                            console.log("Files: ", res);
                                            setImage(res[0].url);
                                            toast({
                                                variant : 'success',
                                                description : 'Carga completa'
                                            });
                                            }}
                                            onUploadError={(error: Error) => {
                                            // Do something with the error.
                                            toast({
                                                variant : 'destructive',
                                                description : `Error! ${error.message}`
                                            });
                                            }}
                                        />
                                  </div>
                                 </>}
                             </FormControl>
                          </FormItem>
                       ) }
                      />
                      <div className="flex flex-row gap-6">
                          <div className="flex-1 flex flex-col gap-6">
                          <FormField
                            control={form.control}
                            name="roomPrice"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio Habitacion</FormLabel>
                              <FormDescription>Precio de la habitacion</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} placeholder="ejem : $250.000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                          />
                          <FormField
                            control={form.control}
                            name="bedCount"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numero de Camas</FormLabel>
                              <FormDescription>Cuantas camas tiene la habitacion</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} max={8} placeholder="ejem : 2 camas" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                          />
                           <FormField
                            control={form.control}
                            name="guestCount"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personas por habitacion</FormLabel>
                              <FormDescription>Cuantas personas puede haber en una habitacion</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} max={6} placeholder="ejem : 4 personas por habitacion" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                          />
                           <FormField
                            control={form.control}
                            name="bathRoomCount"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numero de Baños</FormLabel>
                              <FormDescription>Cuantos baños tiene la habitacion</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} max={2} placeholder="ejem : 1 baño" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-6">
                          <FormField
                            control={form.control}
                            name="breakFastPrice"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio Habitacion</FormLabel>
                              <FormDescription>Precio habitacion por dia ?</FormDescription>
                              <FormControl>
                                <Input type="number" min={0}  placeholder="ejem : $80.000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                            />
                          <FormField
                            control={form.control}
                            name="kingBed"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cama Principal</FormLabel>
                              <FormDescription>La habitacion tiene cama principal cuantas ?</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} max={1} placeholder="ejem : 1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                            />
                            <FormField
                            control={form.control}
                            name="quuenBed"
                            render={({ field }) => (
                            <FormItem>
                              <FormLabel>Camas Secundarias</FormLabel>
                              <FormDescription>Cuantas camas secundarias tiene ?</FormDescription>
                              <FormControl>
                                <Input type="number" min={0} max={4} placeholder="ejem : 1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                    </FormItem>
                                  )}
                            />
                          </div>
                      </div>
                      <div className="pt-4 pb-2">
                      {room ? 
                        <Button type="button" onClick={form.handleSubmit(onSubmit)} className="max-w-[150px]" disabled={isLoading}>
                          {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/>Actualizando</>
                              : <><PencilLine className="mr-2 h-4 w-4"/>Actualizar</>    
                            }
                               </Button>
                             :<Button onClick={form.handleSubmit(onSubmit)} type= "button" className="max-w-[150px]" disabled={isLoading}>
                               {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/>Creando</> : <><Pencil className="mr-2 h-4 w-4"/>Crear Habitacion</>}
                             </Button>}
                      </div>
                      
        </form>
      </Form>
    </div>
  )
}

export default AddRoomForm