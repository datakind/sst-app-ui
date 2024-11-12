import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import ActionSection from '@/Components/Sections/ActionSection';
import DangerButton from '@/Components/Buttons/DangerButton';
import FormSection from '@/Components/Sections/FormSection';
import InputError from '@/Components/Modals/InputError';
import InputLabel from '@/Components/Fields/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import SectionBorder from '@/Components/Fields/SectionBorder';
import TextInput from '@/Components/Fields/TextInput';

const TeamManagement = ({ team, availableRoles, userPermissions }) => {
    const { props } = usePage();
    const [managingRoleFor, setManagingRoleFor] = useState(null);
    const [confirmingLeavingTeam, setConfirmingLeavingTeam] = useState(false);
    const [teamMemberBeingRemoved, setTeamMemberBeingRemoved] = useState(null);

    const addTeamMemberForm = useForm({
        email: '',
        role: null,
    });

    const updateRoleForm = useForm({
        role: null,
    });

    const leaveTeamForm = useForm();
    const removeTeamMemberForm = useForm();

    const addTeamMember = () => {
        addTeamMemberForm.post(route('team-members.store', { team: team.id }), {
            preserveScroll: true,
            onSuccess: () => addTeamMemberForm.reset(),
        });
    };

    const manageRole = (member) => {
        setManagingRoleFor(member);
        updateRoleForm.setData('role', member.membership.role);
    };

    const updateRole = () => {
        if (!managingRoleFor) return;

        updateRoleForm.put(route('team-members.update', { team: team.id, user: managingRoleFor.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setManagingRoleFor(null);
            },
        });
    };

    const confirmLeavingTeam = () => {
        setConfirmingLeavingTeam(true);
    };

    const leaveTeam = () => {
        leaveTeamForm.delete(route('team-members.destroy', { team: team.id, user: props.auth.user.id }), {
            preserveScroll: true,
            onSuccess: () => setConfirmingLeavingTeam(false),
        });
    };

    const confirmTeamMemberRemoval = (member) => {
        setTeamMemberBeingRemoved(member);
    };

    const removeTeamMember = () => {
        if (!teamMemberBeingRemoved) return;

        removeTeamMemberForm.delete(route('team-members.destroy', { team: team.id, user: teamMemberBeingRemoved.id }), {
            preserveScroll: true,
            onSuccess: () => setTeamMemberBeingRemoved(null),
        });
    };

    return (
        <div>
            <ActionSection title="Add Team Members">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={addTeamMemberForm.data.email}
                        onChange={(e) => addTeamMemberForm.setData('email', e.target.value)}
                        autoFocus
                        className="mb-4 w-2/3"
                    />
                    <InputError message={addTeamMemberForm.errors.email} className="mb-4" />

                    <InputLabel htmlFor="role" value="Role" />
                    <select
                        id="role"
                        value={addTeamMemberForm.data.role}
                        onChange={(e) => addTeamMemberForm.setData('role', e.target.value)}
                        className="w-2/3 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <option value="" disabled>Select a role</option>
                        {availableRoles.map((role) => (
                            <option key={role.key} value={role.key}>{role.name}</option>
                        ))}
                    </select>
                    <InputError message={addTeamMemberForm.errors.role} className="mt-2" />

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton onClick={addTeamMember}>Add</PrimaryButton>
                    </div>
            </ActionSection>

            <SectionBorder />

            <ActionSection title="Manage Roles">
                {team.members && team.members.map((member) => (
                    <div key={member.id} className="mt-2 flex items-center">
                        <span className="flex-grow">{member.name} ({member.email})</span>
                        <SecondaryButton onClick={() => manageRole(member)} className="ml-3">Manage Role</SecondaryButton>
                    </div>
                ))}
            </ActionSection>

            {managingRoleFor && (
                <FormSection>
                    <InputLabel htmlFor="role" value="Role" />
                    <select
                        id="role"
                        value={updateRoleForm.data.role}
                        onChange={(e) => updateRoleForm.setData('role', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <option value="" disabled>Select a role</option>
                        {availableRoles.map((role) => (
                            <option key={role.key} value={role.key}>{role.name}</option>
                        ))}
                    </select>
                    <InputError message={updateRoleForm.errors.role} className="mt-2" />

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton onClick={updateRole} className="ml-3">Update</PrimaryButton>
                        <SecondaryButton onClick={() => setManagingRoleFor(null)}>Cancel</SecondaryButton>
                    </div>
                </FormSection>
            )}

            <SectionBorder />

            {userPermissions.canLeaveTeam && (
                <DangerButton onClick={confirmLeavingTeam} className="mt-3">Leave Team</DangerButton>
            )}

            {confirmingLeavingTeam && (
                <FormSection>
                    <div className="mb-4">Are you sure you want to leave this team?</div>
                    <div className="flex justify-end">
                        <DangerButton onClick={leaveTeam} className="ml-3">Leave</DangerButton>
                        <SecondaryButton onClick={() => setConfirmingLeavingTeam(false)}>Cancel</SecondaryButton>
                    </div>
                </FormSection>
            )}

            {teamMemberBeingRemoved && (
                <FormSection>
                    <div className="mb-4">Are you sure you want to remove {teamMemberBeingRemoved?.name || ''} from the team?</div>
                    <div className="flex justify-end">
                        <DangerButton onClick={removeTeamMember} className="ml-3">Remove</DangerButton>
                        <SecondaryButton onClick={() => setTeamMemberBeingRemoved(null)}>Cancel</SecondaryButton>
                    </div>
                </FormSection>
            )}
        </div>
    );
};

export default TeamManagement;
