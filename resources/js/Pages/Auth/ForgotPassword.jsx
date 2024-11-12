import { useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import {router} from '@inertiajs/react';
import AuthenticationCard from '@/Components/Modals/AuthenticationCard';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
import InputError from '@/Components/Modals/InputError';
import AppLayout from "@/Layouts/AppLayout";

export default function ForgotPassword({ status }) {
    const form = useForm({
        email: '',
    });
    function onSubmit(e) {
        e.preventDefault();
        form.post(route('password.email'));
    }
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto mt-12 -mb-12">
                <Head title="Forgot Password"/>

                  <div className="mb-4 text-sm text-gray-600">
                    Forgot your password? No problem. Just let us know your email address
                    and we will email you a password reset link that will allow you to
                    choose a new one.
                  </div>

                  {status && (<div className="mb-4 font-medium text-sm text-green-600">
                      {status}
                    </div>)}

                  <form onSubmit={onSubmit}>
                    <div>
                      <InputLabel htmlFor="email">Email</InputLabel>
                      <TextInput id="email" type="email" className="mt-1 block w-full" value={form.data.email} onChange={e => form.setData('email', e.currentTarget.value)} required autoFocus/>
                      <InputError className="mt-2" message={form.errors.email}/>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                      <PrimaryButton className={classNames({ 'opacity-25': form.processing })} disabled={form.processing}>
                        Email Password Reset Link
                      </PrimaryButton>
                    </div>
                  </form>
            </div>
        </AppLayout>);
}
