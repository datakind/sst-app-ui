import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import BigSuccessAlert from '@/Components/BigSuccessAlert';
import Alert from '@/Components/Alert';
import Spinner from '@/Components/Spinner';

export default function StartPrediction() {
  const [currentStep] = useState(1);
  const [triggeredRun, setTriggeredRun] = useState(false);
  const [result, setResult] = useState('');

  const [batchList, setBatchList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [modelName, setModelName] = useState('');
  const [terms, setTerms] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios
      .get('/models-api')
      .then(res => {
        setModelsList(res.data);
        setModelName(res.data[0]?.name ?? '');
      })
      .catch(err => {
        if (
          err.response != null &&
          err.response.data != null &&
          err.response.data.error != null
        ) {
          setError(Error(err.response.data.error));
        } else {
          setError(err);
        }
      });
  }, []);

  useEffect(() => {
    axios
      .get('/view-uploaded-data')
      .then(res => {
        setBatchList(res.data.batches);
        setBatchName(res.data.batches[0]?.name ?? '');
      })
      .catch(err => {
        if (
          err.response != null &&
          err.response.data != null &&
          err.response.data.error != null
        ) {
          setError(Error(err.response.data.error));
        } else {
          setError(err);
        }
      });
  }, []);

  useEffect(() => {
    if (!batchName || !modelName) return;
    setLoadingTerms(true);
    Promise.all([
      axios.get('/eligible-inference-terms', {
        params: { batch_name: batchName, model_name: modelName },
      }),
      axios.get('/model-api/' + encodeURIComponent(modelName)),
    ])
      .then(([termsRes, modelRes]) => {
        setTerms(termsRes.data.terms);
        // The model's trained inference terms are the default selection.
        setSelectedTerms(
          modelRes.data.academic_terms.filter(label =>
            termsRes.data.terms.some(t => t.term_label === label),
          ),
        );
      })
      .finally(() => setLoadingTerms(false));
  }, [batchName, modelName]);

  const triggerInference = event => {
    event.preventDefault();
    // TODO: enable some way to indicate if it is pdp or not? is that required.
    if (event.target.elements.batch_name.value == '') {
      setError('No batch set.');
      return;
    }
    if (event.target.elements.model_name.value == '') {
      setError('No model set.');
      return;
    }
    axios({
      method: 'post',
      url: '/start-prediction/' + event.target.elements.model_name.value,
      data: {
        batch_name: event.target.elements.batch_name.value,
        is_pdp: true,
        // Omitted when nothing is checked, so the pipeline config decides.
        term_filter: selectedTerms.length > 0 ? selectedTerms : null,
      },
    })
      .then(res => {
        setResult('Run ID: ' + res.data.run_id);
        setTriggeredRun(true);
      })
      .catch(err => {
        if (
          err.response != null &&
          err.response.data != null &&
          err.response.data.error != null
        ) {
          setError(Error(err.response.data.error));
        } else {
          setError(err);
        }
        setTriggeredRun(true);
      });
    return;
  };

  const renderResults = (result, error) => {
    let msg = 'Prediction initiated!';
    if (result == null || result == '') {
      msg = '[ERROR] Prediction request failed with: ' + error;
      return (
        <div className="flex px-36">
          <Alert variant="danger" mainMsg={msg} />
        </div>
      );
    }
    msg = msg + result;
    return (
      <div className="flex px-36">
        <BigSuccessAlert
          mainMsg={msg}
          msgDetails="You will get an email notifying you of the new dashboard results, once they're ready."
        ></BigSuccessAlert>
      </div>
    );
  };

  const renderPredictionParamInputs = () => {
    return (
      <div className="flex w-full flex-col items-center justify-center p-12">
        <h1 className="mb-12 text-5xl font-light">Start Prediction</h1>
        <div className="flex text-gray-700">
          For the most up-to-date Edvise predictions we recommend starting a new
          prediction for each semester.
        </div>
        <div className="flex pb-6 text-gray-700">
          Select the model and batch that you would like to run a prediction on.
        </div>
        <form onSubmit={triggerInference}>
          <div className="justify-center py-3 font-thin">
            <span className="text-2xl">Step 1</span> <br />
            <span className="text-lg">
              Please select an existing batch or import new data.
            </span>
          </div>
          <div className="flex w-full flex-row justify-center gap-x-6">
            {batchList == undefined || batchList.length == 0 ? (
              <select
                className="mb-4 w-full rounded-full border border-gray-200 bg-white px-6 py-2 text-gray-700 focus:border-gray-500 focus:outline-none"
                id="batch_name"
              >
                <option disabled value="">
                  No batches exist
                </option>
              </select>
            ) : (
              <div>
                <select
                  className="mb-4 w-full rounded-full border border-gray-200 bg-white px-6 py-2 text-gray-700 focus:border-gray-500 focus:outline-none"
                  id="batch_name"
                  onChange={e => setBatchName(e.target.value)}
                >
                  {batchList.map(b => (
                    <option key={b.batch_id ?? b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <span className="flex pt-1 font-thin text-black">or</span>
            <Link
              href={route('file-upload')}
              as="button"
              className="mb-4 flex rounded-full border border-[#f79222] bg-[#f79222] px-6 py-2 text-black"
            >
              Upload Data
            </Link>
          </div>
          <div className="py-3 font-thin">
            <span className="text-2xl">Step 2</span>
            <br />
            <span className="text-lg">Please select a model.</span>
          </div>
          {modelsList == undefined || modelsList.length == 0 ? (
            <select
              className="mb-4 flex w-full rounded-full border border-gray-200 bg-white px-6 py-2 text-gray-700 focus:border-gray-500 focus:outline-none"
              id="model_name"
            >
              <option disabled value="">
                No Models exist
              </option>
            </select>
          ) : (
            <select
              className="mb-4 flex w-full rounded-full border border-gray-200 bg-white px-6 py-2 text-gray-700 focus:border-gray-500 focus:outline-none"
              id="model_name"
              onChange={e => setModelName(e.target.value)}
            >
              {modelsList.map(m => (
                <option key={m.name}>{m.name}</option>
              ))}
            </select>
          )}
          {loadingTerms ? (
            <div className="flex w-full justify-center py-3">
              <Spinner mainMsg="Loading academic terms"></Spinner>
            </div>
          ) : (
            terms.length > 0 && (
              <>
                <div className="py-3 font-thin">
                  <span className="text-2xl">Step 3</span>
                  <br />
                  <span className="text-lg">
                    Please select the academic terms to predict.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {terms.map(t => (
                    <label
                      key={t.term_label}
                      className="flex items-center gap-x-2 text-gray-700"
                    >
                      <input
                        type="checkbox"
                        name="academic_terms"
                        value={t.term_label}
                        checked={selectedTerms.includes(t.term_label)}
                        onChange={e =>
                          setSelectedTerms(prev =>
                            e.target.checked
                              ? [...prev, t.term_label]
                              : prev.filter(x => x !== t.term_label),
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="capitalize">{t.term_label}</span>
                      <span className="text-sm text-gray-500">
                        ({t.valid_student_count} students)
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )
          )}
          <div className="flex w-full items-end justify-end pt-12">
            <button type="submit" className="btn btn-primary">
              Generate Predictions
            </button>
          </div>
        </form>
      </div>
    );
  };
  // The title in AppLayout needs to match the nav bar label.
  return (
    <AppLayout
      title="Start Prediction"
      renderHeader={() => (
        <h2 className="text-xl leading-tight font-semibold text-gray-800">
          Start Prediction
        </h2>
      )}
    >
      <div
        className="mx-12 mb-12 flex w-full flex-col rounded-3xl bg-white"
        id="main_area"
      >
        {triggeredRun
          ? renderResults(result, error)
          : renderPredictionParamInputs(currentStep)}
      </div>
    </AppLayout>
  );
}
