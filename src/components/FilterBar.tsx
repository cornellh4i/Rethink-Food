'use client'


import { useFilter } from '@/context/FilterContext';
import { useState } from 'react';

const BOROUGHS = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];


export default function FilterBar({}){
    const{filters, applyFilter} = useFilter(); 

    

    return (
        <>

        <div className='bg-transparent flex gap-2'>
            <input
                type="search"
                placeholder = "Search..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
           
            </input>

            {BOROUGHS.map((borough) => (
                <button 
                    key={borough}
                    onClick = {() => applyFilter(borough)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50`}>
                    {borough}
                </button>
            ))}
            <div>
                
                

                

               

                


            </div>
        </div>
        
        
        
        </>
        
    )
}

// All
// Manhattan
// Brooklyn
// Queens
// Bronx
// Staten Island