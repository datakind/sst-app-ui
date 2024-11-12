<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Exception;
use App\Models\User;
use App\Models\Team;

class LoginController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }
    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function handleGoogleCallback()
    {
        try {
            // Retrieve the user from Google
            $user = Socialite::driver('google')->user();

            // Check if there's an existing user with the same email
            $existingUser = User::where('email', $user->email)->first();

            if ($existingUser) {
                // If the user exists but doesn't have a Google ID, update it
                if (!$existingUser->google_id) {
                    $existingUser->google_id = $user->id;
                    $existingUser->save();
                }

                // Log the existing user in
                Auth::login($existingUser);
                return redirect('/');
            } else {
                // If no user is found, create a new one
                $newUser = User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'google_id' => $user->id,
                    'password' => encrypt(''), // Encrypting an empty string as placeholder
                ]);

                // Create a personal team for the user (required by Jetstream)
                $newTeam = Team::forceCreate([
                    'user_id' => $newUser->id,
                    'name' => explode(' ', $user->name, 2)[0] . "'s Team",
                    'personal_team' => true,
                ]);

                // Save the team and set it as the current team for the user
                $newTeam->save();
                $newUser->current_team_id = $newTeam->id;
                $newUser->save();

                // Log the new user in
                Auth::login($newUser);
                return redirect('/');
            }
        } catch (Exception $e) {
            dd($e->getMessage());
        }
    }

    /**
     * Redirect the user to the Azure authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToAzure()
    {
        return Socialite::driver('azure')->redirect();
    }

    /**
     * Obtain the user information from Azure.
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function handleAzureCallback()
    {
        try {
            // Retrieve the user from Azure
            $user = Socialite::driver('azure')->user();

            // Check if there's an existing user with the same email
            $existingUser = User::where('email', $user->email)->first();

            if ($existingUser) {
                // If the user exists but doesn't have an Azure ID, update it
                if (!$existingUser->azure_id) {
                    $existingUser->azure_id = $user->id;
                    $existingUser->save();
                }

                // Log the existing user in
                Auth::login($existingUser);
                return redirect('/');
            } else {
                // If no user is found, create a new one
                $newUser = User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'azure_id' => $user->id,
                    'password' => encrypt(''), // Encrypting an empty string as placeholder
                ]);

                // Create a personal team for the user (required by Jetstream)
                $newTeam = Team::forceCreate([
                    'user_id' => $newUser->id,
                    'name' => explode(' ', $user->name, 2)[0] . "'s Team",
                    'personal_team' => true,
                ]);

                // Save the team and set it as the current team for the user
                $newTeam->save();
                $newUser->current_team_id = $newTeam->id;
                $newUser->save();

                // Log the new user in
                Auth::login($newUser);
                return redirect('/');
            }
        } catch (Exception $e) {
            dd($e->getMessage());
        }
    }
}
