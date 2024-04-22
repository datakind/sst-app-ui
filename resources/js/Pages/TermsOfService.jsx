import React from 'react';
import AuthenticationCardLogo from '@/Components/AuthenticationCardLogo';
import { Head } from '@inertiajs/react';
import AppLayout from "@/Layouts/AppLayout";

const TermsOfService = ({ terms }) => {
    return (
        <AppLayout>
            <Head title="Terms of Service" />
            <div className="max-w-6xl mx-auto">
                Terms of service details here
                <div
                    className="w-full sm:max-w-2xl mt-6 p-6 bg-white shadow-md overflow-hidden sm:rounded-lg prose"
                    dangerouslySetInnerHTML={{ __html: terms }}
                />
            </div>
        </AppLayout>
    );
};

export default TermsOfService;
