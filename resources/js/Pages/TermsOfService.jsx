import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from "@/Layouts/AppLayout";

const TermsOfService = () => {
    return (
        <AppLayout>
            <Head title="Terms of Service" />
            <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8 mb-24">
                <div className="prose lg:prose-xl">
                    <h2 className="text-header">DataKind’s [AppName] Service Terms and Conditions of Use</h2>
                    <p>DataKind (the “Company”) has developed the [AppName] (available at the entry-point URL [AppUrl]) (the “Site”). [AppName] (“[App]” or the “Service” or “Project”) is [AppDescription]</p>
                    <section className="mb-6">
                        <h3 className="text-2xl font-semibold mb-2">1. USE OF THE SERVICE</h3>
                        <p>We will provide you with, and you desire to receive, access to the Service during the term of any applicable order for Services (“Order”), and subject to your compliance with the terms and conditions set forth herein (the “Terms of Use”). Your continued use of the Service evidences your agreement to be bound by these Terms of Use and constitutes a legally binding contract between you and the Company. IF YOU DO NOT AGREE WITH ANY OF THE TERMS OF USE, YOU ARE NOT PERMITTED TO USE THE SERVICE.</p>
                    </section>
                    <section className="mb-6">
                        <h3 className="text-2xl font-semibold mb-2">2. MODIFICATION OF TERMS OF USE</h3>
                        <p>We reserve the right to change or modify the Terms of Use at our sole discretion at any time. Any change or modification to the Terms of Use will be effective immediately upon posting on the Site. We will take reasonable steps to notify you of any changes or modifications to the Terms of Use. Your continued use of the Service constitutes acceptance of any changes or modifications made by us to the Terms of Use.</p>
                        <p>The Company reserves the right to modify fees at any time for the applicable services upon notice to you. Any such modified fees shall be applicable for all Orders and renewals thereof after the date of such notice.</p>
                    </section>
                    <section className="mb-6">
                        <h3 className="text-2xl font-semibold mb-2">3. SITE USER CONDUCT</h3>
                        <p>In order to access the Site and use the Services, you will need to select a login identification (“User Email”) and a user password (“User Password”) that is unique and entirely different from your User Email. You agree that you will never divulge or share your User Email or User Password with anyone for any reason. You agree not to allow anyone to access or use your user account or provide them with your login information to do so.</p>
                        <p>Submissions of data or commentary to the Site are subject to the Code of Conduct. The Company reserves the right to suspend privileges without notice for behavior that it deems not to be in concordance with the Code.</p>
                        <p>This site carries a Creative Commons (CC BY-SA 4.0) license, which permits re-use of DataKind content when proper attribution is provided. This means you are free to copy, display and distribute DataKind's work, or include our content in derivative works, under the following conditions:</p>
                        <ul className="list-disc list-inside mb-4">
                            <li><strong>Attribution:</strong> You must clearly attribute the work to [AppName], and provide a link back to [AppUrl].</li>
                            <li><strong>ShareAlike:</strong> If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.</li>
                        </ul>
                        <p>For the full legal code of this Creative Commons license, please click here. Please note that some content on this site is owned or co-owned by third parties, and may carry additional copyright restrictions. This is especially true for photos and illustrations — many images have been purchased from shutterstock.com and are licensed only for use on this site, while others carry different Creative Commons licenses that have been determined by their owners. We have made every effort to clearly label such content, regardless of type, but images should be approached with special care. If you have any questions about citing or re-using DataKind content, please contact us.</p>
                    </section>
                    <section className="mb-6">
                        <h3 className="text-2xl font-semibold mb-2">4. INTELLECTUAL PROPERTY RIGHTS</h3>
                        <p>All content or other material available on the Site or through the Service, including but not limited to data, code, images, text, layouts, arrangements, displays, illustrations, audio and video clips, HTML, and files (collectively, the “Content”), are the property of the Company and/or its affiliates or licensors and are protected by copyright, patent and/or other proprietary intellectual property rights under United States and foreign law.</p>
                        <p>Company logos, trademarks and service marks which may appear on the Site (“Marks”), are the property of the Company and are protected under United States and foreign laws. All other trademarks, service marks and logos used on the Site, with or without attribution, are the trademarks, service marks or logos of their respective owners.</p>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
};

export default TermsOfService;
