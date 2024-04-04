"use client"

import { prueba } from '@/app/lib/actions';
// import { Metadata } from 'next';
import { useEffect } from 'react';

// export const metadata: Metadata = {
//     title: 'Customers',
// };

export default function Page() {
    useEffect(() => {
        prueba()
    }, [])
    return <p>Customers Page</p>;
}
