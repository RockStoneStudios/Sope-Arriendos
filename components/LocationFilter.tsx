'use client';
import { useEffect, useState } from "react";
import Container from "./Container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import qs from 'query-string';
import useLocation from "@/hooks/useLocation";
import { ICity, IState } from "country-state-city";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const LocationFilter = () => {
    const [country, setCountry] = useState('CO'); // Inicializar con Colombia
    const [state, setState] = useState('ANT'); // Inicializar con Antioquia
    const [city, setCity] = useState('');
    const [states, setStates] = useState<IState[]>([]);
    const [cities, setCities] = useState<ICity[]>([]);
    const router = useRouter();
    const { getCountryStates, getStateCities } = useLocation();

    useEffect(() => {
        const countryStates = getCountryStates(country);
        if (countryStates) {
            setStates(countryStates);
            setState('ANT'); // Inicializar con Antioquia
            setCity('');
        }
    }, [country]);

    useEffect(() => {
        const stateCities = getStateCities(country, state);
        if (stateCities) {
            // Filtrar las ciudades específicas de Antioquia
            const antioquiaCities = stateCities.filter(city => city.name === 'Sopetrán' || city.name === 'San Jerónimo' || city.name === 'Santa Fe de Antioquia');
            setCities(antioquiaCities);
            setCity('');
        }
    }, [country, state]);

    useEffect(() => {
        if (country === '' && state === '' && city === '') return router.push('/');
        let currentQuery: any = {};
        const searchParams = new URLSearchParams(window.location.search); // Obtener los parámetros de la URL
        searchParams.forEach((value, key) => {
            currentQuery[key] = value; // Construir el objeto de consulta
        });
        if (country) {
            currentQuery['country'] = country;
        }
        if (state) {
            currentQuery['state'] = state;
        }
        if (city) {
            currentQuery['city'] = city;
        }
        if (state === '' && currentQuery.state) {
            delete currentQuery.state;
        }
        if (city === '' && currentQuery.city) {
            delete currentQuery.city;
        }
        const url = qs.stringifyUrl({
            url: '/',
            query: currentQuery
        }, { skipNull: true, skipEmptyString: true });
        router.push(url);
    }, [country, state, city]);

    const handleClear = () => {
        router.push('/');
        setCountry('CO'); // Restaurar a Colombia
        setState('ANT'); // Restaurar a Antioquia
        setCity('');
    }

    return (
        <Container>
            <div className="flex gap-2 md:gap-4 items-center justify-center text-sm">
                <div>
                    <Select
                        value={country}
                        onValueChange={(value) => setCountry(value)}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder='Pais' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="CO" value="CO">
                                Colombia
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select
                        value={state}
                        onValueChange={(value) => setState(value)}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder='Departamento' />
                        </SelectTrigger>
                        <SelectContent>
                            {states.length > 0 && states.map((state) => {
                                return <SelectItem key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select
                        value={city}
                        onValueChange={(value) => setCity(value)}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder='Municipio' />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.length > 0 && cities.map((city) => {
                                return <SelectItem key={city.name} value={city.name}>
                                    {city.name}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    variant='outline'
                    onClick={() => handleClear()}>Limpiar Filtros</Button>
            </div>
        </Container>
    )
}

export default LocationFilter;
