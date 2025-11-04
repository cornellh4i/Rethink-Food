import { useFilter } from '@/context/FilterContext';

interface Organization {
    org_type: string;
    number_of_meals?: number;
}

interface MetricData {
    "Total Restaurants": number;
    "Total CBOS": number;
    "Food from Restaurants": number;
    "Food for CBO": number;
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

    const data: MetricData = {
      "Total Restaurants": totalRestaurants,
      "Total CBOS": totalCBO,
      "Food from Restaurants": foodFromRestaurants,
      "Food for CBO": foodForCBO
    }

    return (
      <>
        <div className="fixed top-0 left-0 right-0 gap-2 flex flex-row justify-evenly items-center bg-white mb-30 p-2 flex-wrap z-50">
          {(Object.keys(data) as Array<keyof MetricData>).map((key) => (
            <div className="rounded-xl bg-[#D9D9D9] w-44 h-24 flex flex-col justify-center items-center">
              <p className="font-bold text-3xl text-black">{data[key]}</p>
              <p className="text-sm text-black">{key}</p>
            </div>
          ))}
        </div>
      </>
    );
        
}
