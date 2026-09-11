import axios from 'axios';
import { route } from 'ziggy-js';
import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Spinner from '@/Components/Spinner';
import AppLayout from '@/Layouts/AppLayout';
import Alert from '@/Components/Alert';
import ConfirmationModal from '@/Components/Modals/ConfirmationModal';
import DangerButton from '@/Components/Buttons/DangerButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import { formatModelName } from '@/utils/stringUtils';

export default function ModelRunHistory({ modelname }) {
  const { auth, institution_view } = usePage().props;
  const userIsDatakinder = auth.user?.access_type === 'DATAKINDER';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // These only need to be set once
  const [modelInfo, setModelInfo] = useState({});
  const [runs, setRuns] = useState([]);
  // These need to be set depending on the current run.
  const [currentRunId, setCurrentRunId] = useState('');
  const [runToDelete, setRunToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setRunToDelete(null);
    }
  };

  const closeArchiveModal = () => {
    if (!isArchiving) {
      setShowArchiveModal(false);
    }
  };

  const archiveModel = async () => {
    if (!modelInfo?.name) {
      return;
    }

    setIsArchiving(true);
    try {
      await axios.patch(`/model/${modelInfo.name}/archive`);
      window.location.assign(route('archived-models'));
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to archive model.';
      setError(Error(message));
      setShowArchiveModal(false);
      setIsArchiving(false);
    }
  };

  const deleteRun = async () => {
    if (!runToDelete || !modelInfo?.name) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/model/${modelInfo.name}/run/${runToDelete.run_id}`);
      setRuns(prev => {
        const next = prev.filter(run => run.run_id !== runToDelete.run_id);
        if (next.length === 0) {
          setError(new Error('NO_RUNS'));
        }
        return next;
      });
      setRunToDelete(null);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to delete run results.';
      setError(Error(message));
      setRunToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchModel = async () => {
      // Get list of models for a given institution
      try {
        const response = await axios.get('/models-api');
        let models = response.data;
        let model = null;
        if (models == null || models.length == 0) {
          // No models for this institution exist.
          setModelInfo(null);
          throw new Error('NO_MODELS');
        } else {
          if (modelname == null || modelname == '') {
            // No model specified, so we just pick one.
            model = models[0];
            setModelInfo(model);
          } else {
            // Find the specific model specified.
            let specifiedModel = models.filter(m => m.name == modelname);
            if (specifiedModel.length == 0) {
              // Specified model not found
              setModelInfo(null);
              throw new Error('Specified model ' + modelname + ' not found.');
            } else {
              model = specifiedModel[0];
              setModelInfo(model);
            }
          }
        }
        if (model != null) {
          const runs_response = await axios.get('/model/' + model.name);
          if (runs_response.data != null && runs_response.data.length != 0) {
            let run_results = runs_response.data;
            setRuns(run_results);
            if (currentRunId == '' && run_results.length >= 1) {
              // Set current run id to the first run (the returned runs are sorted by triggered time from most recent to least recent)
              // The current run id should only be empty on first page load.
              setCurrentRunId(run_results[0].run_id);
            }
          } else {
            throw new Error('NO_RUNS');
          }
        }
      } catch (err) {
        if (
          err.response != null &&
          err.response.data != null &&
          err.response.data.error != null
        ) {
          setError(Error(err.response.data.error));
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [modelname]);

  const canArchiveModel =
    userIsDatakinder &&
    !institution_view &&
    modelInfo?.name &&
    !modelInfo.archived;

  if (runToDelete) {
    return (
      <AppLayout title="Model Results">
        <ConfirmationModal isOpen onClose={closeDeleteModal}>
          <ConfirmationModal.Content title="Delete run results">
            Are you sure you want to delete the results for batch &ldquo;
            {runToDelete.batch_name}&rdquo; from {runToDelete.triggered_at}?
            This action cannot be undone.
          </ConfirmationModal.Content>
          <ConfirmationModal.Footer>
            <SecondaryButton onClick={closeDeleteModal} disabled={isDeleting}>
              Cancel
            </SecondaryButton>
            <DangerButton
              className="ml-2"
              onClick={deleteRun}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DangerButton>
          </ConfirmationModal.Footer>
        </ConfirmationModal>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Model Results">
      {showArchiveModal && (
        <ConfirmationModal isOpen onClose={closeArchiveModal}>
          <ConfirmationModal.Content title="Archive model">
            Are you sure you want to archive &ldquo;
            {formatModelName(modelInfo.name)}&rdquo;? It will be removed from
            Model Results and listed on the Archived Models page.
          </ConfirmationModal.Content>
          <ConfirmationModal.Footer>
            <SecondaryButton onClick={closeArchiveModal} disabled={isArchiving}>
              Cancel
            </SecondaryButton>
            <DangerButton
              className="ml-2"
              onClick={archiveModel}
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </DangerButton>
          </ConfirmationModal.Footer>
        </ConfirmationModal>
      )}
      {
        <div
          className="mx-12 mb-12 flex w-full flex-col rounded-3xl bg-white p-8"
          id="main_area"
        >
          {loading ? (
            <div className="flex w-full justify-center">
              <Spinner mainMsg="Loading"></Spinner>
            </div>
          ) : error != null &&
            !(error.message == 'NO_MODELS' || error.message == 'NO_RUNS') ? (
            <Alert variant="danger" mainMsg={'Error: ' + error.message} />
          ) : (
            <div
              className="flex w-full flex-col items-center"
              id="main_content"
            >
              <h1>Model Run History</h1>
              <div className="relative mt-4 w-full max-w-[1057px]">
                <div className="text-center text-lg font-light">
                  {modelInfo == null || modelInfo == {}
                    ? ''
                    : `Current model: ${formatModelName(modelInfo.name)}`}
                </div>
                {canArchiveModel && (
                  <button
                    type="button"
                    className="text-link absolute top-0 right-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium"
                    onClick={() => setShowArchiveModal(true)}
                  >
                    Archive Model
                  </button>
                )}
              </div>

              {error != null &&
              (error.message == 'NO_MODELS' || error.message == 'NO_RUNS') ? (
                <>
                  {error.message == 'NO_MODELS' ? (
                    <div className="mt-12 mr-24 ml-24 flex h-32 w-3/4 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-500">
                      <div className="flex font-bold">
                        Your institution does not have a model yet.
                      </div>
                      <div className="flex">
                        Please contact Datakind to set up your model at&nbsp;
                        <a href="mailto:education@datakind.org?subject=SST%20Inquiry">
                          education@datakind.org
                        </a>
                        .
                      </div>
                    </div>
                  ) : (
                    <div className="my-12 mr-24 ml-24 flex h-32 w-3/4 flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-500">
                      <div className="flex font-bold">
                        This model does not have any predictions available yet.
                      </div>
                      {userIsDatakinder && !institution_view && (
                        <>
                          <div className="flex">Click below to begin one.</div>
                          <a
                            href={route('start-prediction')}
                            className="flex items-center justify-center rounded-full border border-[#f79222] bg-white px-3 py-2 text-[#f79222]"
                          >
                            Start Prediction
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <></>
              )}

              <div className="mx-auto w-full max-w-[1057px]">
                {runs.length > 0 && (
                  <div className="mt-8 flex w-full justify-center">
                    <table className="edvise-table" id="model-history-table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">User</th>
                          <th scope="col">Batch</th>
                          <th scope="col">Results</th>
                          <th scope="col">Download</th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.map(run => (
                          <tr key={run.run_id}>
                            <td>{run.triggered_at}</td>
                            <td>{run.created_by}</td>
                            <td className="font-medium">{run.batch_name}</td>
                            <td>
                              {run.completed ? (
                                <a
                                  href={route('model-results-overview', [
                                    run.run_id,
                                    modelInfo?.name || '',
                                  ])}
                                  aria-label={`View model results for run on ${run.triggered_at}`}
                                >
                                  View
                                </a>
                              ) : (
                                'Pending'
                              )}
                            </td>
                            <td>
                              {run.completed ? (
                                <a
                                  href={run.output_file_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Download model results for run on ${run.triggered_at}`}
                                >
                                  Download
                                </a>
                              ) : (
                                'Pending'
                              )}
                            </td>
                            <td>
                              {userIsDatakinder && !institution_view && (
                                <button
                                  type="button"
                                  className="cursor-pointer border-0 bg-transparent p-0"
                                  aria-label={`Delete model results for run on ${run.triggered_at}`}
                                  onClick={() => setRunToDelete(run)}
                                >
                                  <TrashIcon
                                    aria-hidden="true"
                                    className="inline-block size-5 shrink-0 align-middle text-gray-700"
                                  />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
    </AppLayout>
  );
}
