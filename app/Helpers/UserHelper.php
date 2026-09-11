<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class UserHelper
{
    // Checks if a given email is a valid existing user. Returns either error or empty string if no error.
    public static function checkEmailExists(string $email): string
    {

        $users = DB::table('users')->where('email', $email)
            ->get();
        if (count($users) == 0) {
            return 'User not found';
        }
        if (count($users) > 1) {
            return 'Unexpected. Multiple users with same email found.';
        }

        return '';
    }

    /**
     * Returns a mapping of the names of a set of users given their user id.
     * Returns false if no user found.
     *
     * @param  array<int, mixed>  $user_uuids
     * @return array<int|string, mixed>|false
     */
    public static function getNames(array $user_uuids): array|false
    {
        $users = DB::table('users')->whereIn('id', $user_uuids)
            ->get();
        if (count($users) == 0) {
            return false;
        }
        $result = [];
        foreach ($users as $u) {
            $result[$u->id] = $u->name;
        }

        return $result;
    }
}
