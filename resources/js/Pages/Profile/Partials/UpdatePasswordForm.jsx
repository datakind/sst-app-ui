import { useForm } from '@inertiajs/react';
import classNames from 'classnames';
import React, { useRef } from 'react';
import {router} from '@inertiajs/react';
import ActionMessage from '@/Components/Modals/ActionMessage';
import FormSection from '@/Components/Sections/FormSection';
import InputError from '@/Components/Modals/InputError';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
export default function UpdatePasswordForm() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const passwordRef = useRef(null);
    const currentPasswordRef = useRef(null);
    function updatePassword() {
        form.put(route('user-password.update'), {
            errorBag: 'updatePassword',
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => {
                if (form.errors.password) {
                    form.reset('password', 'password_confirmation');
                    passwordRef.current?.focus();
                }
                if (form.errors.current_password) {
                    form.reset('current_password');
                    currentPasswordRef.current?.focus();
                }
            },
        });
    }
    return (<FormSection onSubmit={updatePassword} title={'Update Password'} description={'Ensure your account is using a long, random password to stay secure.'} renderActions={() => (<>
          <ActionMessage on={form.recentlySuccessful} className="mr-3">
            Saved.
          </ActionMessage>

          <PrimaryButton className={classNames({ 'opacity-25': form.processing })} disabled={form.processing}>
            Save
          </PrimaryButton>
        </>)}>
      <div className="col-span-6 sm:col-span-4">
        <InputLabel htmlFor="current_password">Current Password</InputLabel>
        <TextInput id="current_password" type="password" className="mt-1 block w-full" ref={currentPasswordRef} value={form.data.current_password} onChange={e => form.setData('current_password', e.currentTarget.value)} autoComplete="current-password"/>
        <InputError message={form.errors.current_password} className="mt-2"/>
      </div>

      <div className="col-span-6 sm:col-span-4">
        <InputLabel htmlFor="password">New Password</InputLabel>
        <TextInput id="password" type="password" className="mt-1 block w-full" value={form.data.password} onChange={e => form.setData('password', e.currentTarget.value)} autoComplete="new-password" ref={passwordRef}/>
        <InputError message={form.errors.password} className="mt-2"/>
      </div>

      <div className="col-span-6 sm:col-span-4">
        <InputLabel htmlFor="password_confirmation">
          Confirm Password
        </InputLabel>
        <TextInput id="password_confirmation" type="password" className="mt-1 block w-full" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.currentTarget.value)} autoComplete="new-password"/>
        <InputError message={form.errors.password_confirmation} className="mt-2"/>
      </div>
    </FormSection>);
}
