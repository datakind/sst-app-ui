import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Welcome() {

    return (
        <AppLayout>
            <div className="px-12">
                <div className="w-full mb-12">
                    <div className="items-center">
                        This is a template for a new DataKind web app.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
