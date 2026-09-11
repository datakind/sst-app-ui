<?php

namespace App\Http\Controllers;

use App\Models\DataDictionary;
use App\Traits\UsesApi;
use Illuminate\Http\Client\Response as HttpClientResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;
use TokenHelper;
use UserHelper;

// use GuzzleHttp\Client;
// use GuzzleHttp\Exception\RequestException;

class ApiController extends Controller
{
    use UsesApi;

    /** Fallback when BACKEND_HTTP_VALIDATE_TIMEOUT_SECONDS is unset or invalid (below 1 second). */
    private const BACKEND_VALIDATE_TIMEOUT_FALLBACK_SECONDS = 300;

    /** Fallback when BACKEND_HTTP_DEFAULT_TIMEOUT_SECONDS is unset or invalid (below 1 second). */
    private const BACKEND_DEFAULT_TIMEOUT_FALLBACK_SECONDS = 30;

    // For printline debugging the following example added in the function will output to console in the 'php artisan serve' pane.
    // $out = new \Symfony\Component\Console\Output\ConsoleOutput();
    // $out->writeln("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1");

    /**
     * Ends the local session when the backend rejects our JWT, so the browser can
     * re-authenticate instead of surfacing a credentials error. The backend sets
     * WWW-Authenticate: Bearer only for a bad or expired token, never for the 401s
     * it returns for insufficient permissions.
     */
    private static function expiredCredentialsResponse(Request $request, HttpClientResponse $resp): ?JsonResponse
    {
        if ($resp->status() != 401 || ! str_contains($resp->header('WWW-Authenticate'), 'Bearer')) {
            return null;
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['error' => 'Your session has expired. Please log in again.'], 419);
    }

    // For local requests, mock out backend calls.
    // Temporarily disabled for rapid development with real API
    public function isLocalRequest(): bool
    {
        // Temporarily return false to use real API in local development.
        // Local mocks (including model_run_id on runs / getRunDetails) are only
        // reached when this returns true — leave them in place for when the
        // APP_ENV=LOCAL branch below is re-enabled.
        return false;

        // Original logic (uncomment when done with rapid development):
        // if (strtoupper(env('APP_ENV')) == 'LOCAL') {
        //     return True;
        // }
        // return False;
    }

    // Constructs a query for Datakinder cases that does not retrieve institution info.
    /**
     * @param  array<int|string, mixed>|null  $req_body
     */
    public function constructDatakinderRequest(Request $request, string $url_piece, string $method, ?array $req_body): JsonResponse|HttpClientResponse
    {
        [$tok, $tokErr] = TokenHelper::GetToken($request);
        if ($tok == '') {
            return response()->json(['error' => $tokErr], 401);
        }

        if ($request->user()->access_type != 'DATAKINDER') {
            return response()->json(['error' => 'Only datakinders can perform this action'], 401);
        }

        $headers = [
            'Authorization' => 'Bearer '.$tok,
            'accept' => 'application/json',
            'Cache-Control' => 'no-cache',
        ];
        $url = config('services.backend.url').$url_piece;
        $resp = null;
        if ($method == 'GET') {
            $resp = Http::withHeaders($headers)->get($url);
        } elseif ($method == 'POST') {
            if ($req_body == null) {
                $resp = Http::withHeaders($headers)->post($url);
            } else {
                $resp = Http::withHeaders($headers)->post($url, $req_body);
            }
        } elseif ($method == 'PATCH') {
            if ($req_body == null) {
                $resp = Http::withHeaders($headers)->patch($url);
            } else {
                $resp = Http::withHeaders($headers)->patch($url, $req_body);
            }
        } else {
            return response()->json(['error' => 'Unrecognized HTTP method'], 500);
        }

        if ($resp->status() != 200) {
            if ($expired = self::expiredCredentialsResponse($request, $resp)) {
                return $expired;
            }
            $errMsg = json_decode($resp->body());
            if ($errMsg == null) {
                return response()->json(['error' => 'Error code: '.$resp->status()], $resp->status());
            }

            return response()->json(['error' => $errMsg->detail], $resp->status());
        }

        return $resp;
    }

    public function addDatakinderApi(Request $request): JsonResponse|HttpClientResponse
    {
        $emails_list = $request->input('emails');
        if ($emails_list == null || count($emails_list) == 0) {
            return response()->json(['error' => 'At least one email required.'], 400);
        }

        foreach ($emails_list as $email) {
            $res = UserHelper::checkEmailExists($email);
            if ($res != '') {
                return response()->json(['error' => $email.' error: '.$res], 400);
            }
        }

        if (ApiController::isLocalRequest()) {
            return response()->json($emails_list, 200);
        }

        return ApiController::constructDatakinderRequest($request, '/datakinders', 'POST', $emails_list);
    }

    public function createInstApi(Request $request): JsonResponse|HttpClientResponse
    {
        if ($request->input('name') == null || $request->input('name') == '') {
            return response()->json(['error' => 'Name required.'], 400);
        }
        if (! preg_match('/^[A-Za-z0-9&_ -]*$/', $request->input('name'))) {
            return response()->json(['error' => 'Name must only include alphanumeric characters, -, _, & and spaces.'], 400);
        }
        $post_request_body = [
            'name' => $request->input('name'),
        ];

        // Optional fields.
        if ($request->input('state') != null && $request->input('state') != '') {
            $post_request_body['state'] = $request->input('state');
        }
        if ($request->input('allowed_schemas') != null) {
            $post_request_body['allowed_schemas'] = $request->input('allowed_schemas');
        }
        if ($request->input('allowed_emails') != null) {
            $post_request_body['allowed_emails'] = $request->input('allowed_emails');
        }
        if ($request->input('is_pdp') != null) {
            if ($request->input('is_pdp') && $request->input('pdp_id') == null) {
                return response()->json(['error' => 'Please set the PDP ID field for schools that support PDP schemas.'], 400);
            }
            $post_request_body['is_pdp'] = $request->input('is_pdp');
        }
        if ($request->input('pdp_id') != null) {
            $post_request_body['pdp_id'] = $request->input('pdp_id');
        }
        if ($request->input('is_edvise') != null) {
            $post_request_body['is_edvise'] = $request->input('is_edvise');
        }
        if ($request->input('edvise_id') != null && $request->input('edvise_id') != '') {
            $post_request_body['edvise_id'] = $request->input('edvise_id');
        }
        if ($request->input('is_legacy') != null) {
            $post_request_body['is_legacy'] = $request->input('is_legacy');
        }
        if ($request->input('legacy_id') != null && $request->input('legacy_id') != '') {
            $post_request_body['legacy_id'] = $request->input('legacy_id');
        }
        if ($request->input('is_genai') != null) {
            $post_request_body['is_genai'] = $request->input('is_genai');
        }
        if ($request->input('genai_id') != null && $request->input('genai_id') != '') {
            $post_request_body['genai_id'] = $request->input('genai_id');
        }
        if ($request->input('retention_days') != null && $request->input('retention_days') != '') {
            $post_request_body['retention_days'] = $request->input('retention_days');
        }

        if (ApiController::isLocalRequest()) {
            return response()->json(['inst_id' => '64dbce41111b46fe8e84c38757477ef2', 'name' => $request->input('name'), 'state' => $request->input('state'), 'pdp_id' => $request->input('pdp_id')], 200);
        }

        return ApiController::constructDatakinderRequest($request, '/institutions', 'POST', $post_request_body);
    }

    public function viewAllInstitutions(Request $request): JsonResponse|HttpClientResponse
    {
        return ApiController::constructDatakinderRequest($request, '/institutions', 'GET', /* No POST body */ null);
    }

    /**
     * GET /institutions/{current inst_id} — details for the institution in session (edit form).
     */
    public function getCurrentInstitutionDetails(Request $request): JsonResponse
    {
        $resp = ApiController::constructInstRequest($request, '', 'GET', null);
        if ($resp instanceof JsonResponse) {
            return $resp;
        }

        return response()->json($resp->json(), $resp->status());
    }

    private static function isValidateUploadRequest(string $urlPiece): bool
    {
        return str_starts_with($urlPiece, '/input/validate-upload');
    }

    /**
     * HTTP client timeout (seconds) when proxying institution requests to BACKEND_URL.
     * Validate-upload needs a long wait for large CSV processing; other paths stay short.
     */
    private static function institutionBackendTimeoutSeconds(string $urlPiece): int
    {
        if (self::isValidateUploadRequest($urlPiece)) {
            $seconds = config('services.backend.http_validate_timeout_seconds');

            return $seconds >= 1 ? $seconds : self::BACKEND_VALIDATE_TIMEOUT_FALLBACK_SECONDS;
        }
        $seconds = config('services.backend.http_default_timeout_seconds');

        return $seconds >= 1 ? $seconds : self::BACKEND_DEFAULT_TIMEOUT_FALLBACK_SECONDS;
    }

    // Constructs a query with the BACKEND_URL+/institutions/<inst> prefix.
    /**
     * @param  array<int|string, mixed>|null  $req_body
     */
    public function constructInstRequest(Request $request, string $url_piece, string $method, ?array $req_body): JsonResponse|HttpClientResponse
    {
        [$tok, $tokErr] = TokenHelper::GetToken($request);

        \Log::info('constructInstRequest - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        \Log::info('constructInstRequest - Token Error: '.$tokErr);
        \Log::info('constructInstRequest - URL piece: '.$url_piece);
        \Log::info('constructInstRequest - Method: '.$method);

        if ($tok == '') {
            \Log::error('constructInstRequest - Token is empty');

            return response()->json(['error' => $tokErr], 401);
        }
        $headers = [
            'Authorization' => 'Bearer '.$tok,
            'accept' => 'application/json',
            'Cache-Control' => 'no-cache',
        ];

        $url = config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$url_piece;
        \Log::info('constructInstRequest - Full URL being called: '.$url);
        \Log::info('constructInstRequest - Query parameters: '.json_encode($request->query()));
        $http = Http::withHeaders($headers)->timeout(self::institutionBackendTimeoutSeconds($url_piece));
        $resp = null;
        if ($method == 'GET') {
            $resp = $http->get($url, $request->query());
        } elseif ($method == 'POST') {
            if ($req_body == null) {
                $resp = $http->post($url);
            } else {
                $resp = $http->post($url, $req_body);
            }
        } elseif ($method == 'PATCH') {
            if ($req_body == null) {
                $resp = $http->patch($url);
            } else {
                $resp = $http->patch($url, $req_body);
            }
        } elseif ($method == 'DELETE') {
            $resp = $http->delete($url);
        } else {
            return response()->json(['error' => 'Unrecognized HTTP method'], 500);
        }

        if ($resp->status() != 200) {
            if ($expired = self::expiredCredentialsResponse($request, $resp)) {
                return $expired;
            }
            $errMsg = json_decode($resp->body());
            if ($errMsg == null) {
                return response()->json(['error' => 'Error code: '.$resp->status()], $resp->status());
            }

            return response()->json(['error' => $errMsg->detail], $resp->status());
        }

        return $resp;
    }

    // Browser-facing proxy; long-running backend calls stream a keepalive before the wait.
    /**
     * @param  array<int|string, mixed>|null  $req_body
     */
    public function constructInstRequestForBrowser(Request $request, string $url_piece, string $method, ?array $req_body): JsonResponse|HttpClientResponse|StreamedResponse
    {
        if (! self::isValidateUploadRequest($url_piece)) {
            return ApiController::constructInstRequest($request, $url_piece, $method, $req_body);
        }

        return response()->stream(function () use ($request, $url_piece, $method, $req_body) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }
            echo str_repeat(' ', 4096);
            flush();

            $resp = ApiController::constructInstRequest($request, $url_piece, $method, $req_body);
            echo $resp instanceof JsonResponse ? $resp->getContent() : $resp->body();
            flush();
        }, 200, [
            'Content-Type' => 'application/json',
            'X-Accel-Buffering' => 'no',
            'Cache-Control' => 'no-cache',
        ]);
    }

    public function EditInstApi(Request $request): JsonResponse|HttpClientResponse
    {
        // Optional fields.
        $req_body = [];
        if ($request->input('name') != null && $request->input('name') != '') {
            $req_body['name'] = $request->input('name');
        }
        if ($request->input('state') != null && $request->input('state') != '') {
            $req_body['state'] = $request->input('state');
        }
        if ($request->input('allowed_schemas') != null) {
            $req_body['allowed_schemas'] = $request->input('allowed_schemas');
        }
        if ($request->input('allowed_emails') != null) {
            $req_body['allowed_emails'] = $request->input('allowed_emails');
        }
        if ($request->input('is_pdp') != null) {
            if ($request->input('is_pdp') && $request->input('pdp_id') == null) {
                return response()->json(['error' => 'Please set the PDP ID field for schools that support PDP schemas.'], 400);
            }
            $req_body['is_pdp'] = $request->input('is_pdp');
        }
        // Forward school-type IDs when present (including null) so API can clear when switching type
        if ($request->has('pdp_id')) {
            $req_body['pdp_id'] = $request->input('pdp_id') ?: null;
        }
        if ($request->input('is_edvise') != null) {
            $req_body['is_edvise'] = $request->input('is_edvise');
        }
        if ($request->has('edvise_id')) {
            $req_body['edvise_id'] = $request->input('edvise_id') ?: null;
        }
        if ($request->input('is_legacy') != null) {
            $req_body['is_legacy'] = $request->input('is_legacy');
        }
        if ($request->has('legacy_id')) {
            $req_body['legacy_id'] = $request->input('legacy_id') ?: null;
        }
        if ($request->input('retention_days') != null && $request->input('retention_days') != '') {
            $req_body['retention_days'] = $request->input('retention_days');
        }

        if (ApiController::isLocalRequest()) {
            return response()->json([
                'inst_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null,
                'name' => $request->input('name'),
                'state' => $request->input('state'),
                'pdp_id' => $request->input('pdp_id'),
            ], 200);
        }

        return ApiController::constructInstRequest($request, '', 'PATCH', $req_body);
    }

    public function createModelApi(Request $request): JsonResponse|HttpClientResponse
    {
        if ($request->user()->access_type != 'DATAKINDER') {
            return response()->json(['error' => 'Only datakinders can perform this action'], 401);
        }
        if ($request->input('name') == null || $request->input('name') == '') {
            return response()->json(['error' => 'Name required.'], 400);
        }
        if (! preg_match('/^[A-Za-z0-9_ -]*$/', $request->input('name'))) {
            return response()->json(['error' => 'Name must only include alphanumeric characters, -, _, and spaces.'], 400);
        }
        $post_request_body = [
            'name' => $request->input('name'),
        ];

        return ApiController::constructInstRequest($request, '/models/', 'POST', $post_request_body);
    }

    public function createBatch(Request $request): JsonResponse|HttpClientResponse
    {

        $post_request_body = [
            'name' => $request->input('name'),
        ];
        if ($request->input('batch_disabled') != null) {
            $post_request_body['batch_disabled'] = $request->input('batch_disabled');
        }
        if ($request->input('file_names') != null) {
            $post_request_body['file_names'] = $request->input('file_names');
        }

        if (ApiController::isLocalRequest()) {

            return response()->json([
                'batch_id' => '1bc27bbe2a124dda983d156fafcca649',
                'inst_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null,
                'file_names_to_ids' => [],
                'name' => $request->input('name'),
                'created_by' => $request->user()->id,
                'deleted' => false,
                'completed' => false,
                'deletion_request_time' => null,
                'created_at' => '2025-02-27T18:57:05',
                'updated_at' => '2025-02-27T18:57:05',
                'updated_by' => $request->user()->id,
            ], 200);
        }

        return ApiController::constructInstRequest($request, '/batch', 'POST', $post_request_body);
    }

    // Retrieves the GCS upload URL.
    public function fileUploadApi(Request $request, string $filename): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {
            return response()->json('local-url-fake-signed', 200);
        }

        return ApiController::constructInstRequest($request, '/upload-url/'.urlencode($filename), 'GET', null);
    }

    // Validates a file that has been uploaded to the GCS bucket already.
    public function fileValidateApi(Request $request, string $filename): JsonResponse|HttpClientResponse|StreamedResponse
    {
        if (ApiController::isLocalRequest()) {

            return response()->json(['name' => 'foo_file.csv', 'inst_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null, 'file_types' => ['UNKNOWN'], 'source' => 'MANUAL_UPLOAD'], 200);
        }

        return ApiController::constructInstRequestForBrowser($request, '/input/validate-upload/'.urlencode($filename), 'POST', null);
    }

    // This shows all output data.
    public function viewOutputData(Request $request): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            // TODO: populate. This isn't yet used by the webapp.
            return response()->json(null, 200);
        }

        return ApiController::constructInstRequest($request, '/output', 'GET', null);
    }

    // Downloading inference output
    public function downloadInfData(Request $request, string $filename): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {
            return response()->json('local-url-fake-signed', 200);
        }

        return ApiController::constructInstRequest($request, '/download-url/'.urlencode($filename), 'GET', null);
    }

    // Triggers prediction run.
    public function startPredictionApi(Request $request, string $model_name): JsonResponse|HttpClientResponse
    {
        $post_request_body = [
            'batch_name' => $request->input('batch_name'),
        ];
        if ($request->input('is_pdp') != null) {
            $post_request_body['is_pdp'] = $request->input('is_pdp');
        }
        if ($request->input('term_filter') != null) {
            $post_request_body['term_filter'] = $request->input('term_filter');
        }

        return ApiController::constructInstRequest($request, '/models/'.urlencode($model_name).'/run-inference', 'POST', $post_request_body);
    }

    // Gets list of models for a given institution
    public function getModels(Request $request): JsonResponse|HttpClientResponse
    {
        return ApiController::constructInstRequest($request, '/models', 'GET', null);
    }

    // Academic terms in a batch that have students eligible for the given model.
    public function getEligibleInferenceTerms(Request $request): JsonResponse|HttpClientResponse
    {
        return ApiController::constructInstRequest($request, '/eligible-inference-terms', 'GET', null);
    }

    // Returns file as bytes
    public function fileBytes(Request $request, string $file_name): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {
            return response()->json(null, 200);
        }

        return ApiController::constructInstRequest($request, '/output-file-contents/'.urlencode($file_name), 'GET', null);
    }

    // Returns file as json
    public function fileJson(Request $request, string $file_name): JsonResponse
    {
        if (ApiController::isLocalRequest()) {
            return response()->json(null, 200);
        }
        $file = $this->fileBytes($request, $file_name);
        if ($file == null) {
            return response()->json(['error' => $file_name.' requested returned null.'], 404);
        }
        // TODO: add error handling if the fileBytes response errors out, we want to bubble that out.
        $data = $file->body();
        $rows = array_map('str_getcsv', explode("\n", $data));
        $header = array_shift($rows);
        $jsonArray = [];
        foreach ($rows as $row) {
            if (count($row) == count($header)) {
                $jsonArray[] = array_combine($header, $row);
            }
        }

        return response()->json($jsonArray);
    }

    // Returns file as png type
    public function filePng(Request $request, string $file_name): JsonResponse|HttpResponse
    {
        if (ApiController::isLocalRequest()) {
            return response()->json(null, 200);
        }
        $file = $this->fileBytes($request, $file_name);
        if ($file == null || $file->body() == null) {
            return response()->json(['error' => $file_name.' requested returned null.'], 404);
        }

        return response($file->body())->header('Content-Type', 'image/png');
    }

    public function convertDateToReadable(string $date_str): string
    {
        // Convert date to readable string.
        // The strings start off with type "2025-02-25T19:48:43"
        $first_parse = explode('T', $date_str);
        $date_val = explode('-', $first_parse[0]);

        return $date_val[1].'/'.$date_val[2].'/'.$date_val[0].' '.$first_parse[1];
    }

    public function modelRuns(Request $request, string $model_name): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            return response()->json([['run_id' => '123', 'inst_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null, 'm_name' => 'latest_enrollment_model', 'created_by' => $request->user()->name, 'triggered_at' => '02/02/2025 19:48:12', 'batch_name' => 'foo_batch', 'completed' => true, 'model_run_id' => 'mock-model-run-123', 'model_version' => '1', 'output_file_link' => 'https://www.google.com']], 200);
        }
        $result = ApiController::constructInstRequest($request, '/models/'.urlencode($model_name).'/runs', 'GET', null);
        // For simplicity, we can make the conversions here as the frontend doesn't want to or need to know the details.
        // E.g. convert user uuid to name and convert the timestamp to human readable string.
        if ($result != null && $result->status() == 200) {
            $output = $result->json();
            if ($output != null) {
                $collected_user_ids = [];
                foreach ($output as $run) {
                    array_push($collected_user_ids, $run['created_by']);
                }
                $user_id_map = UserHelper::getNames($collected_user_ids);
                foreach ($output as $key => $run) {
                    $user_name = $run['created_by'];
                    if ($user_id_map && $user_id_map[$user_name] != null) {
                        $user_name = $user_id_map[$user_name];
                    }
                    $time = ApiController::convertDateToReadable($run['triggered_at']);
                    $run['created_by'] = $user_name;
                    $run['triggered_at'] = $time;
                    // Note that completed indicates the run was completed, output_valid indicates whether a Datakinder has formally approved the file.
                    if ($run['completed'] && $run['output_filename'] != null && $run['output_filename'] != '') {
                        $download_url = ApiController::downloadInfData($request, $run['output_filename']);
                        if ($download_url->status() == 200) {
                            $run['output_file_link'] = $download_url->json();
                        } else {
                            $run['output_file_link'] = '';
                        }
                    }
                    $output[$key] = $run;
                }
            }

            // Set the result to the modified output.
            return response()->json($output);
        }

        return $result;
    }

    public function deleteModelRun(Request $request, string $model_name, string $run_id): JsonResponse|HttpClientResponse
    {
        \Log::info('deleteModelRun called with model_name: '.$model_name.', run_id: '.$run_id);

        if ($request->user()->access_type != 'DATAKINDER') {
            return response()->json(['error' => 'Only datakinders can perform this action'], 401);
        }

        if (ApiController::isLocalRequest()) {
            return response()->json([
                'message' => 'Run deleted successfully',
                'run_id' => $run_id,
                'model_name' => $model_name,
            ], 200);
        }

        $externalUrl = '/models/'.urlencode($model_name).'/run/'.$run_id;

        return ApiController::constructInstRequest($request, $externalUrl, 'DELETE', null);
    }

    // This returns batch and file info for a given inst.
    public function viewUploadedData(Request $request): JsonResponse|HttpClientResponse
    {
        // convert the user ids to names here prior to submission
        $result = ApiController::constructInstRequest($request, '/input', 'GET', null);
        if ($result != null && $result->status() == 200) {
            $output = $result->json();
            if ($output != null) {
                $batches = $output['batches'];
                $collected_user_ids = [];
                foreach ($batches as $batch) {
                    if ($batch['updated_by'] == null) {
                        array_push($collected_user_ids, $batch['created_by']);
                    } else {
                        array_push($collected_user_ids, $batch['created_by']);
                    }
                }
                $user_id_map = UserHelper::getNames($collected_user_ids);
                foreach ($batches as $key => $batch) {
                    $user_name = ($batch['updated_by'] == null) ? $batch['created_by'] : $batch['created_by'];
                    if ($user_id_map && $user_id_map[$user_name] != null) {
                        $user_name = $user_id_map[$user_name];
                    }
                    $time_in = ($batch['updated_at'] == null) ? $batch['created_at'] : $batch['updated_at'];
                    $time = ApiController::convertDateToReadable($time_in);
                    $batch['updated_by'] = $user_name;
                    $batch['updated_at'] = $time;
                    $batches[$key] = $batch;
                }
                $output['batches'] = $batches;
            }

            // Set the result to the modified output.
            return response()->json($output);
        }

        return $result;
    }

    /**
     * Redirect to the appropriate app home: EDA dashboard if the user's institution
     * has at least one valid (non-deleted) batch, otherwise the generic home page.
     */
    public function appHomeRedirect(Request $request): RedirectResponse
    {
        $hasBatches = false;
        $inst_id = ($request->attributes->get('institution') ?? [])['inst_id'] ?? null;
        if ($request->user() && $inst_id) {
            $result = ApiController::constructInstRequest($request, '/input', 'GET', null);
            if ($result->status() === 200) {
                $output = $result->json();
                $batches = $output['batches'] ?? [];
                $validCount = collect($batches)->filter(fn ($b) => empty($b['deleted']))->count();
                $hasBatches = $validCount > 0;
            }
        }

        return $hasBatches
            ? redirect()->route('eda')
            : redirect()->route('home');
    }

    // The below provided by DK.
    public function exampleFunction(Request $request): HttpClientResponse
    {
        $query = http_build_query($request->query());
        $token = $this->authenticateDkApi(null);
        $endpoint = 'product/endpoint';
        $headers = [
            'Authorization' => $token->access,
            'Cache-Control' => 'no-cache',
        ];

        return Http::withHeaders($headers)->get(config('services.dk_api_suite.url').'/'.config('services.dk_api_suite.version').'/'.$endpoint.'?'.$query);
    }

    // Gets support overview data for a given run
    public function getSupportOverview(Request $request, string $inst_id, string $run_id): JsonResponse|HttpClientResponse
    {
        \Log::info('getSupportOverview called with inst_id: '.$inst_id.', run_id: '.$run_id);

        if (ApiController::isLocalRequest()) {
            \Log::info('Local request - Institution ID: '.$inst_id);

            return response()->json([
                [
                    'bin_lower' => '0.8',
                    'bin_upper' => '0.9',
                    'support_score' => '0.85',
                    'count_of_students' => '47',
                    'pct' => '6.71',
                ],
                [
                    'bin_lower' => '0.9',
                    'bin_upper' => '1.0',
                    'support_score' => '0.95',
                    'count_of_students' => '19',
                    'pct' => '2.71',
                ],
                [
                    'bin_lower' => '0.2',
                    'bin_upper' => '0.3',
                    'support_score' => '0.25',
                    'count_of_students' => '91',
                    'pct' => '13.0',
                ],
                [
                    'bin_lower' => '0.5',
                    'bin_upper' => '0.6',
                    'support_score' => '0.55',
                    'count_of_students' => '102',
                    'pct' => '14.57',
                ],
                [
                    'bin_lower' => '0.7',
                    'bin_upper' => '0.8',
                    'support_score' => '0.75',
                    'count_of_students' => '68',
                    'pct' => '9.71',
                ],
                [
                    'bin_lower' => '0.1',
                    'bin_upper' => '0.2',
                    'support_score' => '0.15',
                    'count_of_students' => '40',
                    'pct' => '5.71',
                ],
                [
                    'bin_lower' => '0.3',
                    'bin_upper' => '0.4',
                    'support_score' => '0.35',
                    'count_of_students' => '130',
                    'pct' => '18.57',
                ],
                [
                    'bin_lower' => '0.4',
                    'bin_upper' => '0.5',
                    'support_score' => '0.45',
                    'count_of_students' => '128',
                    'pct' => '18.29',
                ],
                [
                    'bin_lower' => '0.6',
                    'bin_upper' => '0.7',
                    'support_score' => '0.65',
                    'count_of_students' => '75',
                    'pct' => '10.71',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.$inst_id);

        $externalUrl = '/inference/support-overview/'.$run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.$inst_id.$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    protected function readDataDictionary(): mixed
    {
        $response = DataDictionary::all();

        return $response;
    }

    // Gets run details for a specific model run
    public function getRunDetails(Request $request, string $inst_id, string $model_name, string $run_id): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {
            // Mock return based on run_id 123
            if ($run_id == '123') {
                return response()->json([
                    'run_id' => '123',
                    'inst_id' => $inst_id,
                    'm_name' => $model_name,
                    'triggered_at' => '2025-02-25T19:48:43',
                    'created_by' => 'John Doe',
                    'batch_name' => 'test_batch',
                    'completed' => true,
                    'output_filename' => 'model_results_123.csv',
                    'output_file_link' => 'https://example.com/download/model_results_123.csv',
                    'output_valid' => true,
                    'model_run_id' => 'mock-model-run-123',
                    'model_version' => '1',
                ], 200);
            }
        }

        // Production: call external API
        $externalUrl = '/models/'.$model_name.'/run/'.$run_id;
        $result = ApiController::constructInstRequest($request, $externalUrl, 'GET', null);

        // Process the response to add output_file_link like modelRuns does
        if ($result != null && $result->status() == 200) {
            $output = $result->json();
            if ($output != null) {
                // Note that completed indicates the run was completed, output_valid indicates whether a Datakinder has formally approved the file.
                if ($output['completed'] && $output['output_filename'] != null && $output['output_filename'] != '') {
                    $download_url = ApiController::downloadInfData($request, $output['output_filename']);
                    if ($download_url->status() == 200) {
                        $output['output_file_link'] = $download_url->json();
                    } else {
                        $output['output_file_link'] = '';
                    }
                }
            }

            return response()->json($output);
        }

        return $result;
    }

    // Downloads model card for a given model run (model_run_id from inference job)
    public function downloadModelCard(Request $request, string $inst_id, string $model_run_id): JsonResponse|HttpClientResponse|StreamedResponse
    {
        \Log::info('downloadModelCard called with inst_id: '.$inst_id.', model_run_id: '.$model_run_id);
        \Log::info('Production request - Institution ID: '.$inst_id);
        $externalUrl = '/training/model-cards/'.$model_run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.$inst_id.$externalUrl);

        $response = ApiController::constructInstRequest($request, $externalUrl, 'GET', null);

        // If we got a successful response, add download headers
        if ($response->status() == 200) {
            $name = $request->query('name', '');
            $name = is_string($name) ? $name : '';
            $segment = preg_replace('/[^A-Za-z0-9_-]/', '', $name);
            if ($segment === '') {
                $segment = preg_replace('/[^A-Za-z0-9_-]/', '', $model_run_id) ?: 'model';
            }
            $filename = 'edvise-model-card-'.$segment.'.pdf';

            // Add download headers to force file download
            return response()->streamDownload(
                function () use ($response) {
                    echo $response->body();
                },
                $filename,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                    'Cache-Control' => 'no-cache',
                ]
            );
        }

        return $response;
    }

    // Gets top features for a given run
    public function getTopFeatures(Request $request, string $inst_id, string $run_id): JsonResponse|HttpClientResponse
    {
        \Log::info('getTopFeatures called with inst_id: '.$inst_id.', run_id: '.$run_id);

        if (ApiController::isLocalRequest()) {
            \Log::info('Local request - Institution ID: '.$inst_id);

            // Mock data for local development
            return response()->json([
                [
                    'feature_readable_name' => 'GPA Departure',
                    'feature_short_desc' => 'Students who have large changes to their GPA average.',
                    'type' => 'Numerical',
                    'importance' => 0.15,
                    'range' => '0.12 to 0.2',
                ],
                [
                    'feature_readable_name' => 'Course Level 200',
                    'feature_short_desc' => 'Number of 200 courses taken',
                    'type' => 'Numerical',
                    'importance' => 0.09,
                    'range' => '0.05 to 0.12',
                ],
                [
                    'feature_readable_name' => 'Course with MAT',
                    'feature_short_desc' => 'Students taking math courses this term',
                    'type' => 'Numerical',
                    'importance' => 0.08,
                    'range' => '0.04 to 0.1',
                ],
                [
                    'feature_readable_name' => 'Grade B',
                    'feature_short_desc' => 'Number of B grades earned this term',
                    'type' => 'Numerical',
                    'importance' => 0.07,
                    'range' => '0.03 to 0.12',
                ],
                [
                    'feature_readable_name' => 'Course prefix Bio',
                    'feature_short_desc' => 'Students taking biology courses this term',
                    'type' => 'Numerical',
                    'importance' => 0.06,
                    'range' => '0.02 to 0.09',
                ],
                [
                    'feature_readable_name' => 'Modality In Person',
                    'feature_short_desc' => 'Taking in-person courses',
                    'type' => 'Numerical',
                    'importance' => 0.04,
                    'range' => '0.01 to 0.07',
                ],
                [
                    'feature_readable_name' => 'Grade C',
                    'feature_short_desc' => 'Number of C grades earned this term',
                    'type' => 'Numerical',
                    'importance' => 0.04,
                    'range' => '0.01 to 0.07',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.$inst_id);
        $externalUrl = '/inference/top-features/'.$run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.$inst_id.$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    // Gets model runs using request context for institution
    public function modelRunsWithContext(Request $request, string $model_name): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            return response()->json([['run_id' => '123', 'inst_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null, 'm_name' => $model_name, 'created_by' => $request->user()->name, 'triggered_at' => '02/02/2025 19:48:12', 'batch_name' => 'foo_batch', 'completed' => true, 'model_run_id' => 'mock-model-run-123', 'model_version' => '1', 'output_file_link' => 'https://www.google.com']], 200);
        }
        $result = ApiController::constructInstRequest($request, '/models/'.urlencode($model_name).'/runs', 'GET', null);
        // For simplicity, we can make the conversions here as the frontend doesn't want to or need to know the details.
        // E.g. convert user uuid to name and convert the timestamp to human readable string.
        if ($result != null && $result->status() == 200) {
            $output = $result->json();
            if ($output != null) {
                $collected_user_ids = [];
                foreach ($output as $run) {
                    array_push($collected_user_ids, $run['created_by']);
                }
                $user_id_map = UserHelper::getNames($collected_user_ids);
                foreach ($output as $key => $run) {
                    $user_name = $run['created_by'];
                    if ($user_id_map && $user_id_map[$user_name] != null) {
                        $user_name = $user_id_map[$user_name];
                    }
                    $time = ApiController::convertDateToReadable($run['triggered_at']);
                    $run['created_by'] = $user_name;
                    $run['triggered_at'] = $time;
                    // Note that completed indicates the run was completed, output_valid indicates whether a Datakinder has formally approved the file.
                    if ($run['completed'] && $run['output_filename'] != null && $run['output_filename'] != '') {
                        $download_url = ApiController::downloadInfData($request, $run['output_filename']);
                        if ($download_url->status() == 200) {
                            $run['output_file_link'] = $download_url->json();
                        } else {
                            $run['output_file_link'] = '';
                        }
                    }
                    $output[$key] = $run;
                }
            }

            // Set the result to the modified output.
            return response()->json($output);
        }

        return $result;
    }

    // Gets features boxplot statistics for a given run and feature
    public function getFeaturesBoxplotStat(Request $request, string $inst_id, string $run_id): JsonResponse|HttpClientResponse
    {
        \Log::info('getFeaturesBoxplotStat called with inst_id: '.$inst_id.', run_id: '.$run_id);
        \Log::info('getFeaturesBoxplotStat feature_name: '.$request->query('feature_name'));

        if (ApiController::isLocalRequest()) {
            \Log::info('Local request - Institution ID: '.$inst_id);
            // Mock data for local development - generate different data based on feature_name
            $featureName = $request->query('feature_name', 'test_feature');

            // Generate consistent but different mock data based on feature name
            $hash = crc32($featureName);
            $min = round(($hash % 100) / 100, 2);
            $q1 = round($min + (($hash % 50) / 100), 2);
            $median = round($q1 + (($hash % 30) / 100), 2);
            $q3 = round($median + (($hash % 40) / 100), 2);
            $max = round($q3 + (($hash % 60) / 100), 2);
            $count = 200 + ($hash % 200);
            $shapValue = round(($hash % 1000) / 10000, 6);

            return response()->json([
                [
                    'feature_name' => $featureName,
                    'feature_shap_value' => (string) $shapValue,
                    'min' => (string) $min,
                    'q_1' => (string) $q1,
                    'median' => (string) $median,
                    'q_3' => (string) $q3,
                    'max' => (string) $max,
                    'count' => (string) $count,
                    'n_missing' => '0',
                    'feature_readable_name' => ucwords(str_replace('_', ' ', $featureName)),
                    'feature_short_desc' => 'Mock description for '.$featureName,
                    'feature_long_desc' => 'This is mock data for the feature '.$featureName.' generated for local development testing.',
                ],
            ], 200);
        }

        // Production: call external API
        $externalUrl = '/inference/features-boxplot-stat/'.$run_id;
        $result = ApiController::constructInstRequest($request, $externalUrl, 'GET', null);

        if ($result != null && $result->status() == 200) {
            $output = $result->json();
            if ($output != null) {
                return response()->json($output);
            }
        }

        return $result;
    }

    // Gets top features using request context for institution
    public function getTopFeaturesWithContext(Request $request, string $run_id): JsonResponse|HttpClientResponse
    {
        \Log::info('getTopFeaturesWithContext called with run_id: '.$run_id);

        if (ApiController::isLocalRequest()) {

            // Mock data for local development
            return response()->json([
                [
                    'feature_readable_name' => 'GPA Departure',
                    'feature_short_desc' => 'Students who have large changes to their GPA average.',
                    'feature_long_desc' => 'This feature measures the degree to which a student\'s current GPA deviates from their historical GPA average. It helps identify students who may be experiencing academic challenges or improvements that could impact their graduation likelihood.',
                    'type' => 'Numerical',
                    'importance' => 0.15,
                    'range' => '0.12 to 0.2',
                ],
                [
                    'feature_readable_name' => 'Course Level 200',
                    'feature_short_desc' => 'Number of 200 courses taken',
                    'feature_long_desc' => 'Count of intermediate-level courses (200-level) completed by the student. These courses typically represent sophomore-level coursework and indicate progression through the academic curriculum.',
                    'type' => 'Numerical',
                    'importance' => 0.09,
                    'range' => '0.05 to 0.12',
                ],
                [
                    'feature_readable_name' => 'Course with MAT',
                    'feature_short_desc' => 'Students taking math courses this term',
                    'feature_long_desc' => 'Binary indicator showing whether the student is currently enrolled in mathematics courses. Math proficiency is often a strong predictor of academic success and graduation outcomes.',
                    'type' => 'Numerical',
                    'importance' => 0.08,
                    'range' => '0.04 to 0.1',
                ],
                [
                    'feature_readable_name' => 'Grade B',
                    'feature_short_desc' => 'Number of B grades earned this term',
                    'feature_long_desc' => 'Count of B grades received in the current academic term. B grades indicate above-average performance and can be a positive indicator of academic engagement and capability.',
                    'type' => 'Numerical',
                    'importance' => 0.07,
                    'range' => '0.03 to 0.12',
                ],
                [
                    'feature_readable_name' => 'Course prefix Bio',
                    'feature_short_desc' => 'Students taking biology courses this term',
                    'feature_long_desc' => 'Binary indicator for students currently enrolled in biology courses. This helps identify students in specific academic programs and can indicate their academic interests and career paths.',
                    'type' => 'Numerical',
                    'importance' => 0.06,
                    'range' => '0.02 to 0.09',
                ],
                [
                    'feature_readable_name' => 'Modality In Person',
                    'feature_short_desc' => 'Taking in-person courses',
                    'feature_long_desc' => 'Binary indicator showing whether the student is taking traditional in-person courses versus online or hybrid formats. Course modality can impact student engagement and learning outcomes.',
                    'type' => 'Numerical',
                    'importance' => 0.04,
                    'range' => '0.01 to 0.07',
                ],
                [
                    'feature_readable_name' => 'Grade C',
                    'feature_short_desc' => 'Number of C grades earned this term',
                    'feature_long_desc' => 'Count of C grades received in the current academic term. C grades represent average performance and may indicate areas where students need additional support or academic intervention.',
                    'type' => 'Numerical',
                    'importance' => 0.04,
                    'range' => '0.01 to 0.07',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/training/feature_importance/'.$run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    // Deletes a batch using request context for institution
    public function deleteBatchWithContext(Request $request, string $batch_id): JsonResponse|HttpClientResponse
    {
        \Log::info('deleteBatchWithContext called with batch_id: '.$batch_id);

        if (ApiController::isLocalRequest()) {

            // Mock response for local development
            return response()->json([
                'message' => 'Batch deleted successfully',
                'batch_id' => $batch_id,
                'institution_id' => ($request->attributes->get('institution') ?? [])['inst_id'] ?? null,
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/batch/'.$batch_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'DELETE', null);
    }

    public function getFeatureImportance(Request $request, string $inst_id, string $model_run_id): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            // Mock response for local development
            return response()->json([
                [
                    'readable_feature_name' => 'Cumulative Credits Earned',
                    'short_feature_desc' => 'Total credits earned across all terms',
                    'average_shap_magnitude' => '0.0437',
                ],
                [
                    'readable_feature_name' => 'English 1010 Completion',
                    'short_feature_desc' => 'Whether student has completed English 1010',
                    'average_shap_magnitude' => '0.0669',
                ],
                [
                    'readable_feature_name' => 'Course Level 400',
                    'short_feature_desc' => 'Number of senior-level courses taken',
                    'average_shap_magnitude' => '0.0547',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/training/feature_importance/'.$model_run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    public function getConfusionMatrix(Request $request, string $inst_id, string $model_run_id): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            // Mock response for local development
            return response()->json([
                [
                    'true_positive' => '0.8441011235955056',
                    'false_positive' => '0.20485175202156333',
                    'true_negative' => '0.7951482479784366',
                    'false_negative' => '0.15589887640449437',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/training/confusion_matrix/'.$model_run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    public function getRocCurve(Request $request, string $inst_id, string $model_run_id): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            // Mock response for local development
            return response()->json([
                [
                    'threshold' => '0.4632',
                    'true_positive_rate' => '0.856',
                    'false_positive_rate' => '0.2354',
                    'true_positive' => '1219',
                    'false_positives' => '262',
                    'true_negatives' => '851',
                    'false_negatives' => '205',
                ],
                [
                    'threshold' => '0.4606',
                    'true_positive_rate' => '0.8567',
                    'false_positive_rate' => '0.2363',
                    'true_positive' => '1220',
                    'false_positives' => '263',
                    'true_negatives' => '850',
                    'false_negative' => '204',
                ],
                [
                    'threshold' => '0.4585',
                    'true_positive_rate' => '0.8588',
                    'false_positive_rate' => '0.2381',
                    'true_positive' => '1223',
                    'false_positives' => '265',
                    'true_negatives' => '848',
                    'false_negatives' => '201',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/training/roc_curve/'.$model_run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    public function getTrainingSupportOverview(Request $request, string $inst_id, string $model_run_id): JsonResponse|HttpClientResponse
    {
        if (ApiController::isLocalRequest()) {

            // Mock response for local development
            return response()->json([
                [
                    'bin_lower' => '0.05',
                    'bin_upper' => '0.15',
                    'count_of_students' => '45',
                ],
                [
                    'bin_lower' => '0.15',
                    'bin_upper' => '0.25',
                    'count_of_students' => '78',
                ],
                [
                    'bin_lower' => '0.25',
                    'bin_upper' => '0.35',
                    'count_of_students' => '112',
                ],
                [
                    'bin_lower' => '0.35',
                    'bin_upper' => '0.45',
                    'count_of_students' => '156',
                ],
                [
                    'bin_lower' => '0.45',
                    'bin_upper' => '0.55',
                    'count_of_students' => '203',
                ],
                [
                    'bin_lower' => '0.55',
                    'bin_upper' => '0.65',
                    'count_of_students' => '189',
                ],
                [
                    'bin_lower' => '0.65',
                    'bin_upper' => '0.75',
                    'count_of_students' => '167',
                ],
                [
                    'bin_lower' => '0.75',
                    'bin_upper' => '0.85',
                    'count_of_students' => '134',
                ],
                [
                    'bin_lower' => '0.85',
                    'bin_upper' => '0.95',
                    'count_of_students' => '89',
                ],
            ], 200);
        }

        \Log::info('Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
        $externalUrl = '/training/support-overview/'.$model_run_id;
        \Log::info('Production request - External API URL: '.$externalUrl);
        \Log::info('Production request - Full external URL: '.config('services.backend.url').'/institutions/'.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null).$externalUrl);

        return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);
    }

    public function updateBatch(Request $request, string $inst_id, string $batch_id): JsonResponse|HttpClientResponse
    {
        try {
            // Validate required fields
            $request->validate([
                'name' => 'required|string|max:255',
                'batch_disabled' => 'boolean',
                'file_ids' => 'array',
                'file_names' => 'array',
                'completed' => 'boolean',
                'deleted' => 'boolean',
            ]);

            \Log::info('updateBatch called with batch_id: '.$batch_id);

            // Handle local development
            if (ApiController::isLocalRequest()) {

                \Log::info('updateBatch - Local development mode, returning mock response');

                return response()->json([
                    'message' => 'Batch updated successfully',
                    'batch_id' => $batch_id,
                    'name' => $request->input('name'),
                ], 200);
            }

            // Handle production - use constructInstRequest

            \Log::info('updateBatch - Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
            $externalUrl = '/batch/'.$batch_id;
            \Log::info('updateBatch - External API URL: '.$externalUrl);

            // Prepare the request body for the external API
            $requestBody = [
                'name' => $request->input('name'),
                'batch_disabled' => $request->input('batch_disabled', false),
                'file_ids' => $request->input('file_ids', []),
                'file_names' => $request->input('file_names', []),
                'completed' => $request->input('completed', false),
                'deleted' => $request->input('deleted', false),
            ];

            \Log::info('updateBatch - Request body: '.json_encode($requestBody));

            return ApiController::constructInstRequest($request, $externalUrl, 'PATCH', $requestBody);

        } catch (\Exception $e) {
            \Log::error('updateBatch error: '.$e->getMessage());

            return response()->json(['error' => 'Failed to update batch'], 500);
        }
    }

    public function getEdaData(Request $request, string $inst_id, string $batch_id): JsonResponse|HttpClientResponse
    {
        try {
            if (! $batch_id) {
                return response()->json(['error' => 'Batch ID is required'], 400);
            }

            \Log::info('getEdaData called with inst_id: '.$inst_id.', batch_id: '.$batch_id);

            \Log::info('getEdaData - Production request - Institution ID: '.(($request->attributes->get('institution') ?? [])['inst_id'] ?? null));
            $externalUrl = '/batch/'.$batch_id.'/eda';
            \Log::info('getEdaData - External API URL: '.$externalUrl);

            return ApiController::constructInstRequest($request, $externalUrl, 'GET', null);

        } catch (\Exception $e) {
            \Log::error('getEdaData error: '.$e->getMessage());
            \Log::error('getEdaData error trace: '.$e->getTraceAsString());

            return response()->json(['error' => 'Failed to fetch EDA data: '.$e->getMessage()], 500);
        }
    }
}
