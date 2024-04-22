import React, { useState } from 'react';
import {router} from "@inertiajs/react";

export default function ShowTrainingStatus(props) {
    const {  } = props;
    const [jobRunId, setJobRunId] = useState('');
    const [queryType, setQueryType] = useState('all');

    const handleSubmit = (e) => {
        e.preventDefault();

        router.get(route('get.training-status'), {
            job_run_id: jobRunId,
            query_type: queryType
        })
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="jobRunId">Job Run ID:</label>
                    <input
                        type="text"
                        id="jobRunId"
                        value={jobRunId}
                        onChange={(e) => setJobRunId(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="queryType">Query Type:</label>
                    <select
                        id="queryType"
                        value={queryType}
                        onChange={(e) => setQueryType(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="recent">Recent</option>
                    </select>
                </div>
                <button type="submit">Submit</button>
            </form>
        </>
    );
}
