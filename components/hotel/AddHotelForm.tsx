'use client'


import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel, Room } from "@prisma/client"
import { useForm } from "react-hook-form";
import  {TypeOf, z} from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Textarea } from "@/components/ui/textarea"

import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { UploadButton } from '../uploadthing';
import { useToast } from "../ui/use-toast";
import Image from "next/image";
import { Button } from "../ui/button";
import { Eye, Loader2, Pencil, PencilLine, Plus, Terminal, Trash, XCircle } from "lucide-react";
import axios from 'axios';
import useLocation from '../../hooks/useLocation';
import { ICity, IState } from "country-state-city";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import { getAllStates } from "country-state-city/lib/state";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AddRoomForm from "../room/AddRoomForm";

import RoomCard from "../room/RoomCard";
import { Separator } from "../ui/separator";

interface AddHotelFormProps {
    hotel : HotelWithRooms | null
}

export type HotelWithRooms = Hotel & {
    rooms : Room[]
}

const formSchema = z.object({
  title : z.string().min(3,{
     message : 'El titulo debe tener minimo 3 caracteres'
  }),
  description : z.string().min(10,{
    message : 'La descripcion debe tener un minimo de 10 caracteres'
  }),
  image : z.string().min(1,{
     message : 'La imagen es requerida'
  }),

  country : z.string().min(2,{
     message : 'El pais debe tener minimo 2 caracteres'
  }),
  state : z.string().optional(),
  city  : z.string().optional(),
  locationDescription : z.string().min(10,{
     message : 'La descripcion debe tener minimo 10 caracteres'
  }),
  swimmingPool : z.boolean().optional(),
  gym : z.boolean().optional(),
  turco : z.boolean().optional(),
  jacuzzi : z.boolean().optional(),
  bar : z.boolean().optional(),
  grillRoast : z.boolean().optional(),
  wifi  : z.boolean().optional(),
  freeParking : z.boolean().optional(),
  sports_scene : z.boolean().optional(),
  poolTable : z.boolean().optional()
  
});


const AddHotelForm = ({hotel} : AddHotelFormProps) => {
  
     const [image,setImage] = useState<string | undefined>(hotel?.image);
     const [imageIsDeleting,setImageIsDeleting] = useState(false);
     const [states,setStates] = useState<IState[]>([]);
     const [cities,setCities] = useState<ICity[]>([]);
     const [isLoading,setIsLoading] = useState(false);
     const [isHotelDeleting,setIsHotelDeleting] = useState(false);
     const [open,setOpen] = useState(false);
     const router = useRouter();
     const {toast} = useToast();
     const {getAllCountries,getCountryStates,getStateCities} = useLocation();
     const countries = getAllCountries();
   

    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : hotel || {
            title : '',
            description : '',
            image : '',
            country : '',
            state : '',
            city : '',
            locationDescription : '',
            swimmingPool : false,
            gym : false,
            turco : false,
            jacuzzi : false,
            bar : false,
            grillRoast : false,
            wifi : false,
            freeParking : false,
            sports_scene : false,
            poolTable : false

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

     useEffect(()=>{
           const selectedCountry = form.watch('country');
           const countryStates = getCountryStates(selectedCountry);
           if(countryStates) {
             setStates(countryStates);
           }
     },[form.watch('country')]);


     useEffect(()=>{
        const selectedCountry = form.watch('country');
        const selectedState =  form.watch('state');
        const stateCities = getStateCities(selectedCountry,selectedState);
        if(stateCities) {
          setCities(stateCities);
        }
  },[form.watch('country'),form.watch('state')]);


    const handleDeleteHotel = async (hotel :HotelWithRooms) => {
           setIsHotelDeleting(true);
           const getImageKey = (src:string) => src.substring(src.lastIndexOf('/')+1);
           try{
             const imageKey = getImageKey(hotel.image);
             await axios.post('/api/uploadthing/delete',{imageKey});
             await axios.delete(`/api/hotel/${hotel.id}`);
             setIsHotelDeleting(false);
             toast({
                variant : 'success',
                description : 'Hotel Borrado'
             })
           }catch(error){
            console.log(error);
            setIsHotelDeleting(false);
            toast({
                variant : 'destructive',
                description : 'Borrado de hotel no pudo ser completado'
             });
           }
    }


    function onSubmit(values: z.infer<typeof formSchema>) {
         setIsLoading(true);
         if(hotel){
        
            axios.patch(`/api/hotel/${hotel.id}`,values).then((res)=>{
                toast({variant : 'success',description: 'Hotel Actualizado'});
                router.push(`/hotel/${res.data.id}`);
                setIsLoading(false);
            }).catch((error)=>{
                console.log(error);
                toast({
                    variant : 'destructive',
                    description : 'Algo salio Mal'
                });

                setIsLoading(false);
            })
         }else {
            axios.post('/api/hotel',values).then((res)=> {
                toast({
                    variant : 'success',
                    description : 'Propiedad Creada !!'
                });
                router.push(`/hotel/${res.data.id}`);
                setIsLoading(false);
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

      const handleDialogOpen = () => {
        setOpen(prev => !prev)
      }

  return (
    <div>
        <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <h3 className="text-lg font-semibold">{hotel? 'Actualiza Propiedad' : 'Describe tu Propiedad'}</h3>
                <div className="flex flex-col md:flex-row gap-6">
                     <div className="flex-1 flex flex-col gap-6">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre Propiedad</FormLabel>
                        <FormDescription>Proveenos el nombre de hotel o finca</FormDescription>
                        <FormControl>
                            <Input placeholder="Ingresa Nombre de tu Propiedad" {...field} />
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
                        <FormLabel>Descripcion  Hotel</FormLabel>
                        <FormDescription>Proveenos una descripción</FormDescription>
                        <FormControl>
                            <Textarea placeholder="Regalanos una descripcion del lugar " {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                          )}
                      />
                      <div>
                         <FormLabel>Escoge Comodidades</FormLabel>
                         <FormDescription>Escoge Comodidades populares en tu propiedad</FormDescription>
                         <div className="grid grid-cols-2 gap-4 mt-2">
                                 <FormField
                                    control={form.control}
                                    name="swimmingPool"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Piscina</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="gym"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Gym</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                  <FormField
                                    control={form.control}
                                    name="jacuzzi"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Jacuzzi</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                  <FormField
                                    control={form.control}
                                    name="turco"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Turco</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="bar"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Bar</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="wifi"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>WIFI</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="grillRoast"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Asador</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="freeParking"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Estacionamiento</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                 <FormField
                                    control={form.control}
                                    name="sports_scene"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Cancha</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                      )}
                                 />
                                  <FormField
                                    control={form.control}
                                    name="poolTable"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                                    
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel>Mesa Billar</FormLabel>
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
                             <FormDescription>Escoge una imagen que describa su propiedad </FormDescription>
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
                     </div>
                     <div className="flex-1 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <FormField 
                             control={form.control}
                             name= 'country'
                             render={({field})=>(
                                <FormItem>
                                    <FormLabel>Seleccionar Pais</FormLabel>
                                    <FormDescription>En cual pais esta alojada tu Propiedad!!</FormDescription>
                                    <Select
                                     disabled = {isLoading}
                                     onValueChange={field.onChange}
                                     defaultValue={field.value}
                                    >
                                        <SelectTrigger className="bg-background">
                                          <SelectValue defaultValue={field.value} placeholder= "Seleccionar Pais" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                countries.map((country) => (
                                                    <SelectItem 
                                                     key={country.isoCode}
                                                    value={country.isoCode}>{country.name}</SelectItem>
                                                ))
                                            }
                                          
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                                
                             )}
                            
                            />
                            <FormField 
                             control={form.control}
                             name= 'state'
                             render={({field})=>(
                                <FormItem>
                                    <FormLabel>Seleccionar Departamento</FormLabel>
                                    <FormDescription>En que departamento esta tu propiedad</FormDescription>
                                    <Select
                                     disabled = {isLoading || states.length <1}
                                     onValueChange={field.onChange}
                                     defaultValue={field.value}
                                    >
                                        <SelectTrigger className="bg-background">
                                          <SelectValue defaultValue={field.value} placeholder= "Seleccionar Departamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                states.map((state) => (
                                                    <SelectItem 
                                                     key={state.isoCode}
                                                    value={state.isoCode}>{state.name}</SelectItem>
                                                ))
                                            }
                                          
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                                
                                
                             )}
                            
                            />
                           
                            
                            
                        </div>
                        <FormField 
                             control={form.control}
                             name= 'city'
                             render={({field})=>(
                                <FormItem>
                                    <FormLabel>Seleccionar Municipio</FormLabel>
                                    <FormDescription>En que Municipio esta tu Propiedad </FormDescription>
                                    <Select
                                     disabled = {isLoading || cities.length < 1}
                                     onValueChange={field.onChange}
                                     defaultValue={field.value}
                                    >
                                        <SelectTrigger className="bg-background">
                                          <SelectValue defaultValue={field.value} placeholder= "Seleccionar Municipio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                cities.map((city) => (
                                                    <SelectItem 
                                                     key={city.name}
                                                    value={city.name}>{city.name}</SelectItem>
                                                ))
                                            }
                                          
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                                
                                
                             )}
                            
                            />
                            <FormField 
                             control={form.control}
                             name= 'locationDescription'
                             render={({field})=>(
                                <FormItem>
                                    <FormLabel>Describir Lugar</FormLabel>
                                    <FormDescription>Cuentanos acerca del lugar donde esta tu propiedad</FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Localizado en el barrio avenida siempre viva . .. ." {...field}>

                                        </Textarea>
                                    </FormControl>
                                    <FormMessage/>
                                      
                                </FormItem>
                                
                                
                             )}
                            
                            />
                             {
                                 hotel && !hotel.rooms.length && 
                                 <Alert className="bg-indigo-600 text-white">
                                    <Terminal className="h-4 w-4 stroke-slate-50" />
                                     <AlertTitle>Un ultimo paso</AlertTitle>
                                     <AlertDescription>
                                        Tu Propiedad ha sido registrada satisfactoriamente.
                                        <div>Por favor agregue habitaciones para completar</div>
                                     </AlertDescription>
                                 </Alert>
                             }

                             
                            <div className="flex justify-between gap-2 flex-wrap">
                               {hotel && 
                                <Button
                                 type='button' className="max-w-[150px]" disabled = {isHotelDeleting || isLoading}
                                onClick={()=> handleDeleteHotel(hotel)} variant= 'ghost'>
                                 {isHotelDeleting ? <><Loader2 className="mr-2 h-4 w-4"/>Borrando</>
                                  : <><Trash/>Borrar</> 
                                }
                                </Button>}

                                 {hotel && <Button onClick={()=> router.push(`/hotel-details/${hotel.id}`)} variant='outline' type='button'><Eye className="mr-2 h-4 w-4"/>Ver</Button>}
                                {hotel && 
                                  <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger>
                                        <Button 
                                         className="max-w-[150px]"
                                        type='button' variant='outline'>
                                         <Plus className="mr-2 h-4 w-4" />
                                         Agregar Habitacion
                                         </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[900px] w-[90%]">
                                            <DialogHeader className="px-2">
                                            <DialogTitle>Agregar una Habitacion</DialogTitle>
                                            <DialogDescription>
                                                Agregar detalles acerca de la Habitacion 
                                             </DialogDescription>
                                            </DialogHeader>
                                            <AddRoomForm hotel={hotel} handleDialogOpen={handleDialogOpen}/>
                                        </DialogContent>
                                   </Dialog>
                              }
                               
                               {hotel ? 
                               
                               <Button className="max-w-[150px]" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/>Actualizando</>
                                 : <><PencilLine className="mr-2 h-4 w-4"/>Actualizar</>    
                            }
                               </Button>
                             :<Button className="max-w-[150px]" disabled={isLoading}>
                               {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/>Creando</> : <><Pencil className="mr-2 h-4 w-4"/>Crear Propiedad</>}
                             </Button>}
                            </div>
                            {hotel && !!hotel.rooms.length && <div>
                                <Separator/>
                                <h3 className="text-lg font-semibold my-4">Habitaciones</h3>    
                                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                                    {hotel.rooms.map(room =>(
                                        <RoomCard key={room.id} hotel={hotel} room={room}/>
                                    ))}
                      </div>
                    </div>
                    }
                     </div>
                     
                </div>
           

             </form>
        </Form>
    </div>
  )
            }

export default AddHotelForm