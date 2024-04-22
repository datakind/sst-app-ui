import React, {useEffect, useState} from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import ShowTrainingStatus from "@/Components/ShowTrainingStatus";
import UploadTrainingData from "@/Components/UploadTrainingData";

export default function Welcome({
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
            <div className="m-6 bg-background rounded-md">ShowTrainingStatus
                <ShowTrainingStatus />
            </div>
            <div className="m-6 bg-background rounded-md">UploadTrainingData
                <UploadTrainingData />
            </div>
            <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12">
                    <div className="col-span-5">
                        <div className="text-3xl font-bold text-secondary-dark">
                            Headline text goes here.
                        </div>
                        <div className="text-gray-light my-6">
                            Some<br/>
                            Snappy<br/>
                            Description<br/>
                            Here<br/>
                        </div>
                        <Link href={route('explore-data')}
                              className="bg-primary rounded-lg text-white py-2 px-4 border border-primary hover:bg-transparent hover:text-primary">
                            Get Started
                        </Link>
                    </div>
                    <div className="col-span-7 w-full h-96 bg-background grid place-items-center">
                        Tool demo
                    </div>
                </div>
                <div className="border-b border-2 border-background my-24"></div>
                <div className="w-full mb-36">
                    <div className="items-center">
                        <div className="text-3xl font-bold text-secondary-dark text-center">
                            How to use SST
                        </div>
                        <div className="text-gray-light my-6 max-w-fit mx-auto">
                            <div className="flex items-justify-center items-center my-4">
                                <div className="bg-primary rounded-full h-6 w-6 text-white mr-2 grid items-center text-center">
                                    1
                                </div>
                                <div>
                                    Do this
                                </div>
                            </div>
                            <div className="flex items-justify-center items-center my-4">
                                <div className="bg-primary rounded-full h-6 w-6 text-white mr-2 grid items-center text-center">
                                    2
                                </div>
                                <div>
                                    Then do this
                                </div>
                            </div>
                            <div className="flex items-justify-center items-center my-4">
                                <div className="bg-primary rounded-full h-6 w-6 text-white mr-2 grid items-center text-center">
                                    3
                                </div>
                                <div>
                                    Download
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
