import { router } from '@inertiajs/core';
import { Link, Head, usePage } from '@inertiajs/react';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import Dropdown from '@/Components/Dropdown';
import AppLogo from '@/Icons/AppLogo';
//import ReactGA from "react-ga4";
//ReactGA.initialize("G-WNT7KSPY8N");
import {ChevronDownIcon} from '@heroicons/react/24/outline'


export default function AppLayout({ title, renderHeader, children, }) {
    const user = usePage().props.auth.user;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {setIsMobile(window.innerWidth < 768);};
        window.addEventListener('resize', handleResize);
        return () => {window.removeEventListener('resize', handleResize);};
    }, []);
    let profilePhoto;
    if(user !== null) {profilePhoto = 'https://ui-avatars.com/api/?name=' + user.name + '&color=717171&background=ffffff'}else{profilePhoto = 'none'};
    const pathname = window.location.pathname;
    if (isMobile) {
        return (
            <div className="">
                <div className="flex flex-row gap-4 items-center p-12 w-full bg-white shadow-md border-b z-50"><AppLogo/></div>
                <div className="p-12">
                    <div className="mb-4">This application is not optimized for mobile devices at this time. Please visit the site on desktop.</div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="min-h-screen items-center pt-24">
                <div className="sm:fixed sm:top-0 p-6 text-right w-full bg-white border-b shadow-md z-50">
                    <div className="max-w-6xl mx-auto flex justify-between">
                        <div className="flex items-justify-center items-center">
                            <div className="flex flex-row gap-4 items-center mr-6"><AppLogo className="w-full"/></div>
                            <div className="flex justify-between flex-grow items-center gap-6 text-nowrap text-sm">
                                <Link href={route('home')}
                                      className={pathname.length===1 ? 'text-gray' : 'text-gray-light hover:text-gray'}>
                                    Home
                                </Link>
                                <Link href={route('resources')}
                                      className={pathname === '/resources' ? 'text-gray' : 'text-gray-light hover:text-gray'}>
                                    Resources
                                </Link>
                                <Link href={route('documentation')}
                                      className={pathname === '/documentation' ? 'text-gray' : 'text-gray-light hover:text-gray'}>
                                    Documentation
                                </Link>
                                <Link href={route('explore-data')}
                                      className={pathname === '/explore-data' ? 'bg-transparent rounded-lg text-primary py-2 px-4 border border-primary' : 'bg-primary rounded-lg text-white py-2 px-4 border border-primary hover:bg-transparent hover:text-primary'}>
                                    Explore the Data
                                </Link>
                            </div>
                        </div>
                        <div className={user === null ? 'sm:right-0 flex text-nowrap text-sm items-justify-center items-center gap-6' : 'hidden'}>
                            <Link href={route('login')} className={pathname.includes('/login') ? 'text-gray' : 'text-gray-light hover:text-gray'}>
                                Sign in
                            </Link>
                            <Link href={route('register')} className={pathname.includes('/register') ? 'bg-transparent rounded-lg text-primary py-2 px-4 border border-primary hover:bg-primary hover:text-white' : 'bg-primary rounded-lg text-white py-2 px-4 border border-primary hover:bg-transparent hover:text-primary'}>
                                Sign Up
                            </Link>
                        </div>
                        <div className={user !== null ? 'ml-9 relative items-justify-center items-center' : 'hidden'}>
                            <Dropdown>
                                <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent leading-4 font-medium rounded-md text-navigation focus:outline-none transition ease-in-out duration-150">
                                        <img className="h-8 w-8 rounded-full border border-gray-light"
                                             src={profilePhoto}></img>
                                        <ChevronDownIcon className="pl-1 h-4 w-4"/>
                                    </button>
                                </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('dashboard')}>Activity</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log
                                        Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                <div className="pt-6 min-h-screen px-12">{children}</div>
                <div className="bottom-0 py-6 bg-background shadow-md grid justify-center w-full">
                    <div className="grid grid-cols-3 text-center text-sm min-w-[30rem]">
                        <Link href={route('privacy-policy')} className="max-w-[8rem] text-right hover:underline">Privacy
                            Policy</Link>
                        <Link href={route('terms-of-service')} className="max-w-[8rem] mx-auto hover:underline">Terms of
                            Service</Link>
                        <Link href={route('license')} className="max-w-[8rem] hover:underline">License</Link>
                    </div>
                </div>
            </div>
        );
    }
}
