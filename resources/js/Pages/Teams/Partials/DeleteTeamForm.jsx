import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import ActionSection from '@/Components/Sections/ActionSection';
import ConfirmationModal from '@/Components/Modals/ConfirmationModal';
import DangerButton from '@/Components/Buttons/DangerButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';

const DeleteTeamForm = ({ team }) => {
  const [confirmingTeamDeletion, setConfirmingTeamDeletion] = useState(false);
  const { delete: deleteTeam, processing } = useForm({});

  const confirmTeamDeletion = () => {
    setConfirmingTeamDeletion(true);
  };

  const handleDeleteTeam = () => {
    deleteTeam(route('teams.destroy', team), {
      errorBag: 'deleteTeam',
    });
  };

  return (
    <ActionSection>
      <div className="title">
        Delete Team
      </div>

      <div className="description">
        Permanently delete this team.
      </div>

      <div className="content">
        <div className="max-w-xl text-sm text-gray-600 dark:text-gray-400">
          Once a team is deleted, all of its resources and data will be permanently deleted. Before deleting this team, please download any data or information regarding this team that you wish to retain.
        </div>

        <div className="mt-5">
          <DangerButton onClick={confirmTeamDeletion}>
            Delete Team
          </DangerButton>
        </div>

        {/* Delete Team Confirmation Modal */}
        <ConfirmationModal show={confirmingTeamDeletion} onClose={() => setConfirmingTeamDeletion(false)}>
          <div className="modal-title">
            Delete Team
          </div>

          <div className="modal-content">
            Are you sure you want to delete this team? Once a team is deleted, all of its resources and data will be permanently deleted.
          </div>

          <div className="modal-footer">
            <SecondaryButton onClick={() => setConfirmingTeamDeletion(false)}>
              Cancel
            </SecondaryButton>

            <DangerButton
              className={processing ? 'opacity-25' : ''}
              disabled={processing}
              onClick={handleDeleteTeam}
            >
              Delete Team
            </DangerButton>
          </div>
        </ConfirmationModal>
      </div>
    </ActionSection>
  );
};

export default DeleteTeamForm;
