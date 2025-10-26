'use client'


import { useFilter } from '@/context/FilterContext';

const BOROUGHS = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];


export default function FilterBar({}){
    const{filters, applyFilter} = useFilter(); 

    return (
        <></>
        
    )
}

// All
// Manhattan
// Brooklyn
// Queens
// Bronx
// Staten Island