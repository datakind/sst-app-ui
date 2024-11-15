import { Link, useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import {router} from '@inertiajs/react';
import AuthenticationCard from '@/Components/Modals/AuthenticationCard';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import AppLayout from "@/Layouts/AppLayout";

export default function VerifyEmail({ status }) {
    const form = useForm({});
    const verificationLinkSent = status === 'verification-link-sent';
    function onSubmit(e) {
        e.preventDefault();
        form.post(route('verification.send'));
    }
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto mt-12 -mb-12">
                <Head title="Email Verification"/>

                  <div className="mb-4 text-sm text-gray-600">
                    Before continuing, could you verify your email address by clicking on
                    the link we just emailed to you? If you didn't receive the email, we
                    will gladly send you another.
                  </div>

                  {verificationLinkSent && (<div className="mb-4 font-medium text-sm text-green-600">
                      A new verification link has been sent to the email address you
                      provided during registration.
                    </div>)}

                  <form onSubmit={onSubmit}>
                    <div className="mt-4 flex items-center justify-between">
                      <PrimaryButton className={classNames({ 'opacity-25': form.processing })} disabled={form.processing}>
                        Resend Verification Email
                      </PrimaryButton>

                      <div>
                        <Link href={route('profile.show')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Edit Profile
                        </Link>
                      </div>

                      <Link href={route('logout')} method="post" as="button" className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2">
                        Log Out
                      </Link>
                    </div>
                  </form>
            </div>
        </AppLayout>);
}
