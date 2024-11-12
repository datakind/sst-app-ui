import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function License() {
    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto p-12 border rounded-lg border-gray-200 shadow bg-white">
                <div className="prose">
                    <h2 className="text-2xl font-bold mb-4">Copyright</h2>

                    <p className="mb-4">
                        This site carries a Creative Commons (CC BY 4.0) license, which permits re-use of DataKind content when proper attribution is provided. This means you are free to copy, display and distribute DataKind's work, or include our content in derivative works, under the following conditions:
                    </p>

                    <h3 className="text-xl font-semibold mb-2">Attribution</h3>
                    <p className="mb-4">
                        You must clearly attribute the work to DataKind, and provide a link back to <a href="https://www.datakind.org" target="_blank" className="text-blue-600 hover:underline">www.datakind.org</a>.
                    </p>

                    <p className="mb-4">
                        For the full legal code of this Creative Commons license, please click <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" className="text-blue-600 hover:underline">here</a>. Please note that some content on this site is owned or co-owned by third parties, and may carry additional copyright restrictions. This is especially true for photos and illustrations — many images have been purchased from shutterstock.com and are licensed only for use on this site, while others carry different Creative Commons licenses that have been determined by their owners. DataKind has made every effort to clearly label such content, regardless of type, but images should be approached with special care. If you have any questions about citing or re-using DataKind content, please contact us.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
