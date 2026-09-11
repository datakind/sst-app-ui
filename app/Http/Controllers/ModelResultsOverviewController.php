<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\Response as HttpClientResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ModelResultsOverviewController extends Controller
{
    public function show(Request $request, string $run_id, string $modelName): InertiaResponse|JsonResponse
    {
        $inst_id = ($request->attributes->get('institution') ?? [])['inst_id'] ?? null;

        if (! $inst_id) {
            return Inertia::render('ModelResultsOverview', [
                'job_run_id' => $run_id,
                'modelName' => $modelName,
                'model_run_id' => null,
                'runDetails' => null,
                'featureImportanceData' => [],
                'error' => 'No institution context',
            ]);
        }

        $api = app(ApiController::class);

        $runDetailsResp = $api->getRunDetails($request, $inst_id, $modelName, $run_id);
        $runDetails = $this->responseData($runDetailsResp);
        $model_run_id = is_array($runDetails) ? ($runDetails['model_run_id'] ?? null) : null;

        $error = null;
        if ($runDetails === null) {
            $error = 'Could not load run details from the API';
        } elseif (! $model_run_id) {
            $error = 'model_run_id unavailable from API for this run';
        }

        $featureImportanceData = [];
        if ($model_run_id) {
            $fiResp = $api->getFeatureImportance($request, $inst_id, $model_run_id);
            $featureImportanceData = $this->responseData($fiResp);
            if (! is_array($featureImportanceData)) {
                $featureImportanceData = [];
            }
        }

        return Inertia::render('ModelResultsOverview', [
            'job_run_id' => $run_id,
            'modelName' => $modelName,
            'model_run_id' => $model_run_id,
            'runDetails' => $runDetails,
            'featureImportanceData' => $featureImportanceData,
            'error' => $error,
        ]);
    }

    /**
     * @return array<int|string, mixed>|null
     */
    private function responseData(HttpClientResponse|JsonResponse|null $response): ?array
    {
        if ($response === null) {
            return null;
        }

        if ($response instanceof JsonResponse) {
            if ($response->getStatusCode() !== 200) {
                return null;
            }

            return $response->getData(true);
        }

        if ($response->status() !== 200) {
            return null;
        }

        return $response->json();
    }
}
