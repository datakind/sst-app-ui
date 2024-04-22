import React, { useState } from 'react';
import { router } from "@inertiajs/react";

export default function UploadTrainingData(props) {
    const { } = props;
    const [file, setFile] = useState('');
    const [institutionId, setInstitutionId] = useState('jjc-transfer');
    const [automlMetric, setAutomlMetric] = useState('recall');
    const [useAutoml, setUseAutoml] = useState('true');

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('institution_id', institutionId);
        formData.append('automl_metric', automlMetric);
        formData.append('use_automl', useAutoml);

        router.post(route('post.training-data'), formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="file">File:</label>
                    <input
                        type="file"
                        id="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <div>
                    <label htmlFor="institutionId">Institution ID:</label>
                    <input
                        type="text"
                        id="institutionId"
                        value={institutionId}
                        onChange={(e) => setInstitutionId(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="automlMetric">Automl Metric:</label>
                    <input
                        type="text"
                        id="automlMetric"
                        value={automlMetric}
                        onChange={(e) => setAutomlMetric(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="useAutoml">Use Automl:</label>
                    <select
                        id="useAutoml"
                        value={useAutoml}
                        onChange={(e) => setUseAutoml(e.target.value)}
                    >
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
                <button type="submit">Submit</button>
            </form>
        </>
    );
}
