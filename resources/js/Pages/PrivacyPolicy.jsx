import React from 'react';
import AuthenticationCardLogo from '@/Components/AuthenticationCardLogo';
import { Head } from '@inertiajs/react';
import AppLayout from "@/Layouts/AppLayout";

const PrivacyPolicy = ({ policy }) => {
    return (
        <AppLayout>
            <Head title="Privacy Policy" />
            <div className="max-w-6xl mx-auto">
                Privacy policy details here
                <div
                    className="w-full sm:max-w-2xl mt-6 p-6 bg-white shadow-md overflow-hidden sm:rounded-lg prose"
                    dangerouslySetInnerHTML={{ __html: policy }}
                />
            </div>
        </AppLayout>
    );
};

export default PrivacyPolicy;
