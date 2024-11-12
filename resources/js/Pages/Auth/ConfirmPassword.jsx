import { useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import {router} from '@inertiajs/react';
import AuthenticationCard from '@/Components/Modals/AuthenticationCard';
import InputError from '@/Components/Modals/InputError';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
import AppLayout from "@/Layouts/AppLayout";

export default function ConfirmPassword() {
    const form = useForm({
        password: '',
    });
    function onSubmit(e) {
        e.preventDefault();
        form.post(route('password.confirm'), {
            onFinish: () => form.reset(),
        });
    }
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto mt-12 -mb-12">
                <Head title="Secure Area"/>

                  <div className="mb-4 text-sm text-gray-600">
                    This is a secure area of the application. Please confirm your password
                    before continuing.
                  </div>

                  <form onSubmit={onSubmit}>
                    <div>
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <TextInput id="password" type="password" className="mt-1 block w-full" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} required autoComplete="current-password" autoFocus/>
                      <InputError className="mt-2" message={form.errors.password}/>
                    </div>

                    <div className="flex justify-end mt-4">
                      <PrimaryButton className={classNames('ml-4', { 'opacity-25': form.processing })} disabled={form.processing}>
                        Confirm
                      </PrimaryButton>
                    </div>
                  </form>
            </div>
        </AppLayout>);
}
