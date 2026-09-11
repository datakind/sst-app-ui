<?php

namespace App\Http\Controllers;

use App\Helpers\InstitutionHelper;
use App\Models\Invite;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InviteController extends Controller
{
    /**
     * Show the invite validation form
     */
    public function showInviteForm(): InertiaResponse
    {
        return Inertia::render('Auth/InviteValidation');
    }

    /**
     * Validate an invite code and show registration form
     */
    public function validateInvite(Request $request): RedirectResponse
    {
        $request->validate([
            'invite_code' => 'required|string|max:64',
        ]);

        $invite = Invite::where('invite_code', $request->invite_code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $invite) {
            return back()->withErrors([
                'invite_code' => 'Invalid or expired invite code.',
            ]);
        }

        // Check if user already exists
        $existingUser = User::where('email', $invite->email)->first();

        if ($existingUser) {
            if ($existingUser->invite_validated) {
                // User already validated, redirect to login
                return redirect()->route('login')
                    ->withErrors(['invite_code' => 'This email is already registered and validated. Please log in instead.']);
            }
            // If user exists but not validated, allow them to proceed with invite validation
            // (This includes SSO users who need to validate their invite)
        }

        // Store invite in session for registration
        session(['valid_invite' => $invite]);

        // Log the flow for debugging
        \Log::info("Invite validated for email: {$invite->email}, redirecting to registration");

        return redirect()->route('register');
    }

    /**
     * Show the registration form (only accessible with valid invite)
     */
    public function showRegistrationForm(): InertiaResponse|RedirectResponse
    {
        if (! session('valid_invite')) {
            return redirect()->route('invite.validation');
        }

        $invite = session('valid_invite');

        // Check if this is an SSO user by looking at the existing user record
        $existingUser = User::where('email', $invite->email)->first();
        $isSsoUser = $existingUser && ($existingUser->google_id || $existingUser->azure_id);

        return Inertia::render('Auth/Register', [
            'invite' => [
                'email' => $invite->email,
                'role' => $invite->role,
                'institution_id' => $invite->institution_id,
            ],
            'isSsoUser' => $isSsoUser,
        ]);
    }

    /**
     * Process user registration
     */
    public function register(Request $request): RedirectResponse
    {

        if (! session('valid_invite')) {
            return redirect()->route('invite.validation');
        }

        $invite = session('valid_invite');

        // Check if this is an SSO user by looking at existing user record or session
        $existingUser = User::where('email', $invite->email)->first();
        $isSsoUser = session('sso_user', false) || ($existingUser && ($existingUser->google_id || $existingUser->azure_id));

        $request->validate([
            'name' => 'required|string|max:255',
            'password' => $isSsoUser ? 'nullable' : 'required|string|min:8|confirmed',
            'accepted_terms' => 'required|accepted',
        ]);

        // Use the existing user we already queried above

        if ($existingUser) {
            // If user exists but isn't invite-validated, update them
            if (! $existingUser->invite_validated) {
                $updateData = [
                    'name' => $request->name,
                    'invite_validated' => true,
                    'accepted_terms' => true,
                    'access_type' => $invite->role,
                    'inst_id' => $invite->institution_id,
                ];

                // Only update password if not an SSO user
                if (! $isSsoUser) {
                    $updateData['password'] = Hash::make($request->password);
                }

                $existingUser->update($updateData);

                // Mark invite as used
                $invite->markAsUsed();

                // Clear session
                session()->forget('valid_invite');
                session()->forget('sso_user');
                session()->forget('sso_user_data');

                Auth::login($existingUser);
                InstitutionHelper::syncUserFromBackend($request);

                return redirect()->intended(route('model-run-history'));
            } else {
                // User already validated, redirect to login
                session()->forget('valid_invite');

                return redirect()->route('login')
                    ->withErrors(['email' => 'This email is already registered and validated. Please log in instead.']);
            }
        }

        // Create new user if none exists
        $userData = [
            'name' => $request->name,
            'email' => $invite->email,
            'invite_validated' => true,
            'accepted_terms' => true,
            'access_type' => $invite->role,
            'inst_id' => $invite->institution_id,
        ];

        // Set password: required for non-SSO; use random placeholder for SSO (column is NOT NULL)
        if (! $isSsoUser) {
            $userData['password'] = Hash::make($request->password);
        } else {
            $userData['password'] = Hash::make(Str::random(64));
        }

        // Add SSO provider IDs if available
        if ($isSsoUser && session('sso_user_data')) {
            $ssoData = session('sso_user_data');
            if (isset($ssoData['google_id'])) {
                $userData['google_id'] = $ssoData['google_id'];
            }
            if (isset($ssoData['azure_id'])) {
                $userData['azure_id'] = $ssoData['azure_id'];
            }
        }

        $user = User::create($userData);

        // Create personal team for SSO users (required by Jetstream)
        if ($isSsoUser) {
            $team = Team::forceCreate([
                'user_id' => $user->id,
                'name' => explode(' ', $user->name, 2)[0]."'s Team",
                'personal_team' => true,
            ]);

            $team->save();
            $user->current_team_id = $team->id;
            $user->save();
        }

        // Mark invite as used
        $invite->markAsUsed();

        session()->forget('valid_invite');
        session()->forget('sso_user');
        session()->forget('sso_user_data');

        Auth::login($user);
        InstitutionHelper::syncUserFromBackend($request);

        return redirect()->intended(route('model-run-history'));
    }

    /**
     * Create an invite (admin only)
     */
    public function createInvite(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:MODEL_OWNER,DATAKINDER',
            'institution_id' => 'required_if:role,MODEL_OWNER|nullable|string',
            'expires_in_days' => 'nullable|integer|min:1|max:30',
        ]);

        $invite = Invite::create([
            'email' => $request->email,
            'role' => $request->role,
            'institution_id' => $request->institution_id,
            'expires_at' => now()->addDays($request->expires_in_days ?? 7),
            'invited_by' => Auth::id(),
        ]);

        // Send invite email
        $this->sendInviteEmail($invite);

        return back()->with('success', 'Invite created successfully');
    }

    /**
     * Send invite email
     */
    private function sendInviteEmail(Invite $invite): void
    {
        // TODO: Create and send invite email
        // This would typically use Laravel's Mail facade
        // For now, we'll just log it
        \Log::info("Invite sent to {$invite->email} with code: {$invite->invite_code}");
    }

    /**
     * List all invites (admin only)
     */
    public function listInvites(Request $request): InertiaResponse
    {
        $perPageParam = $request->input('per_page', 20);

        if ($perPageParam === 'all') {
            $totalInvites = Invite::count();
            $perPage = max($totalInvites, 1);
        } else {
            $perPage = (int) $perPageParam;
            if ($perPage <= 0) {
                $perPage = 20;
            }
        }

        $invites = Invite::with('invitedBy')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Invites', [
            'invites' => $invites,
            'filters' => [
                'per_page' => $perPageParam,
            ],
        ]);
    }

    /**
     * Resend invite (admin only)
     */
    public function resendInvite(Invite $invite): RedirectResponse
    {
        if ($invite->is_used) {
            return back()->withErrors([
                'message' => 'Cannot resend used invite',
            ]);
        }

        // Extend expiration
        $invite->update([
            'expires_at' => now()->addDays(7),
        ]);

        // Resend email
        $this->sendInviteEmail($invite);

        return back()->with('success', 'Invite resent successfully');
    }

    /**
     * Delete invite (admin only)
     */
    public function deleteInvite(Invite $invite): RedirectResponse
    {
        if ($invite->is_used) {
            return back()->withErrors([
                'message' => 'Cannot delete used invite',
            ]);
        }

        $invite->delete();

        return redirect()->route('admin.invites')->with('success', 'Invite deleted successfully');
    }
}
