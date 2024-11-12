import { Link, useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import {router} from '@inertiajs/react';
import useTypedPage from '@/Hooks/useTypedPage';
import AuthenticationCard from '@/Components/Modals/AuthenticationCard';
import Checkbox from '@/Components/Fields/Checkbox';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
import InputError from '@/Components/Modals/InputError';
import AppLayout from "@/Layouts/AppLayout";

export default function Register() {
    const page = useTypedPage();
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    function onSubmit(e) {
        e.preventDefault();
        form.post(route('register'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto mt-12 -mb-12">
                <Head title="Register"/>
                  <form onSubmit={onSubmit}>
                    <div>
                      <InputLabel htmlFor="name">Name</InputLabel>
                      <TextInput id="name" type="text" className="mt-1 block w-full" value={form.data.name} onChange={e => form.setData('name', e.currentTarget.value)} required autoFocus autoComplete="name"/>
                      <InputError className="mt-2" message={form.errors.name}/>
                    </div>

                    <div className="mt-4">
                      <InputLabel htmlFor="email">Email</InputLabel>
                      <TextInput id="email" type="email" className="mt-1 block w-full" value={form.data.email} onChange={e => form.setData('email', e.currentTarget.value)} required/>
                      <InputError className="mt-2" message={form.errors.email}/>
                    </div>

                    <div className="mt-4">
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <TextInput id="password" type="password" className="mt-1 block w-full" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} required autoComplete="new-password"/>
                      <InputError className="mt-2" message={form.errors.password}/>
                    </div>

                    <div className="mt-4">
                      <InputLabel htmlFor="password_confirmation">
                        Confirm Password
                      </InputLabel>
                      <TextInput id="password_confirmation" type="password" className="mt-1 block w-full" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.currentTarget.value)} required autoComplete="new-password"/>
                      <InputError className="mt-2" message={form.errors.password_confirmation}/>
                    </div>

                    {page.props.jetstream.hasTermsAndPrivacyPolicyFeature && (<div className="mt-4">
                        <InputLabel htmlFor="terms">
                          <div className="flex items-center">
                            <Checkbox name="terms" id="terms" checked={form.data.terms} onChange={e => form.setData('terms', e.currentTarget.checked)} required/>

                            <div className="ml-2">
                              I agree to the
                              <a target="_blank" href={route('terms.show')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Terms of Service
                              </a>
                              and
                              <a target="_blank" href={route('policy.show')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Privacy Policy
                              </a>
                            </div>
                          </div>
                          <InputError className="mt-2" message={form.errors.terms}/>
                        </InputLabel>
                      </div>)}

                    <div className="flex items-center justify-end mt-4">
                      <Link href={route('login')} className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Already registered?
                      </Link>

                      <PrimaryButton className={classNames('ml-4', { 'opacity-25': form.processing })} disabled={form.processing}>
                        Register
                      </PrimaryButton>
                    </div>
                  </form>
                <div className="flex flex-col space-y-4 mt-12">
                    <a href="/auth/google" className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            alt="Google Logo"
                            className="w-5 h-5 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Sign up with Google</span>
                    </a>
                    <a href="/auth/azure" className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png"
                            alt="Microsoft Logo"
                            className="w-5 h-5 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Sign up with Microsoft</span>
                    </a>
                </div>

            </div>
        </AppLayout>
    );
}
