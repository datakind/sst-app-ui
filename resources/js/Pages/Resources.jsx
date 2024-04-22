import React, {useEffect, useState} from 'react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Resources({
        canLogin,
        canRegister,
        laravelVersion,
        phpVersion,
    }) {
    const route = useRoute();
    const page = useTypedPage();
    const [people, setPeople] = useState([]);

    useEffect(()=>{
        axios.get(route('get.insights'))
            .then(res => {
                setPeople(res.data);
            })
            .catch(err => {console.log(err);}, []);
    }, []);


    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
                Resources
            </div>
        </AppLayout>
    );
}
