import { useFilter } from '@/context/FilterContext';

interface Organization {
    org_type: string;
    number_of_meals?: number;
}

export default function MetricBar({}){
    const { filteredDestinations } = useFilter();

    const orgs = Array.isArray(filteredDestinations)
        ? filteredDestinations
        : (filteredDestinations as any)?.organizations || [];


    const totalRestaurants = orgs
    .filter((org: Organization) => org.org_type === 'restaurant').length



    const totalCBO = orgs
    .filter((org: Organization) => org.org_type === 'cbo').length
    
    const foodFromRestaurants = orgs
    .filter((org: Organization) => org.org_type === 'restaurant')
    .reduce((sum: number, dest: Organization) => sum + (dest.number_of_meals || 0), 0);

    const foodForCBO = orgs
    .filter((org: Organization) => org.org_type === 'cbo')
    .reduce((sum: number, dest: Organization) => sum + (dest.number_of_meals || 0), 0);

    return (
        <>
            <div className = "fixed top-0 left-0 right-0 flex gap-2 justify-around text-white bg-green-400">
                <p>Total Restaurants: {totalRestaurants}</p>

                <p>Total CBOs: {totalCBO} </p>

                <p>Food From Restaurants: {foodFromRestaurants}</p>

                <p>Food to CBOs: {foodForCBO}</p>

                
            </div>

        </>

    )
        
}
