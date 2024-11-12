import React, { useState } from 'react';
import axios from 'axios';
import ActionSection from '@/Components/Sections/ActionSection';
import InputError from '@/Components/Modals/InputError';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Fields/TextInput';
import ActionMessage from '@/Components/Modals/ActionMessage';

const UpdateTeamNameForm = ({ team, permissions }) => {
    const [name, setName] = useState(team.name);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const updateTeamName = async () => {
        setProcessing(true);
        setErrors({});
        try {
            const response = await axios.put(route('teams.update', team), { name });
            if (response.status === 200) {
                setRecentlySuccessful(true);
            }
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ActionSection title="Team Name" onSubmitted={updateTeamName}>
            <div className="">
                <div className="mb-6">
                    <InputLabel value="Team Owner" />
                    <div className="flex items-center mt-2">
                        <img
                            className="w-12 h-12 rounded-full object-cover"
                            src={team.owner.profile_photo_url}
                            alt={team.owner.name}
                        />
                        <div className="ml-4">
                            <div className="text-gray-900">{team.owner.name}</div>
                            <div className="text-gray-700 text-sm">{team.owner.email}</div>
                        </div>
                    </div>
                </div>

                {/* Team Name */}
                <div className="mb-6">
                    <InputLabel htmlFor="name" value="Team Name" />
                    <TextInput
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        className="mt-1 block w-full w-2/3"
                        disabled={!permissions.canUpdateTeam}
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>
            </div>

            {permissions.canUpdateTeam && (
                <div className="flex justify-items-end justify-end space-x-4 mt-6">
                    <ActionMessage on={recentlySuccessful} className="mr-3">
                        Saved.
                    </ActionMessage>
                    <PrimaryButton
                        className={processing ? 'opacity-25' : ''}
                        disabled={processing}
                        onClick={updateTeamName}
                    >
                        Save
                    </PrimaryButton>
                </div>
            )}
        </ActionSection>
    );
};

export default UpdateTeamNameForm;
