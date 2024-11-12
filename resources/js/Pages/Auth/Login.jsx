import { Link, useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import {router} from '@inertiajs/react';
import AuthenticationCard from '@/Components/Modals/AuthenticationCard';
import Checkbox from '@/Components/Fields/Checkbox';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
import InputError from '@/Components/Modals/InputError';
import AppLayout from "@/Layouts/AppLayout";
export default function Login({ canResetPassword, status }) {
    const form = useForm({
        email: '',
        password: '',
        remember: '',
    });
    function onSubmit(e) {
        e.preventDefault();
        form.post(route('login'), {
            onFinish: () => form.reset('password'),
        });
    }
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto mt-12 -mb-12">
                <Head title="login"/>

                {status && (<div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>)}

                <form onSubmit={onSubmit}>
                    <div>
                        <InputLabel htmlFor="email">Email</InputLabel>
                        <TextInput id="email" type="email" className="mt-1 block w-full" value={form.data.email} onChange={e => form.setData('email', e.currentTarget.value)} required autoFocus/>
                        <InputError className="mt-2" message={form.errors.email}/>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <TextInput id="password" type="password" className="mt-1 block w-full" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} required autoComplete="current-password"/>
                        <InputError className="mt-2" message={form.errors.password}/>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center">
                            <Checkbox name="remember" checked={form.data.remember === 'on'} onChange={e => form.setData('remember', e.currentTarget.checked ? 'on' : '')}/>
                            <span className="ml-2 text-sm text-gray-600">
              Remember me
            </span>
                        </label>
                    </div>

                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mt-4">
                        {canResetPassword && (<div>
                            <Link href={route('password.request')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Forgot your password?
                            </Link>
                        </div>)}

                        <div className="flex items-center justify-end">
                            <Link href={route('register')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Need an account?
                            </Link>

                            <PrimaryButton className={classNames('ml-4', { 'opacity-25': form.processing })} disabled={form.processing}>
                                Log in
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
                <div className="flex flex-col space-y-4 mt-12">
                    <a href="/auth/google" className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            alt="Google Logo"
                            className="w-5 h-5 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                    </a>
                    <a href="/auth/azure" className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png"
                            alt="Microsoft Logo"
                            className="w-5 h-5 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Sign in with Microsoft</span>
                    </a>
                </div>
            </div>
        </AppLayout>
        );
}
