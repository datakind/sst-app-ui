<?php

namespace App\Console\Commands;

use App\Models\Invite;
use Illuminate\Console\Command;

class CreateTestInvite extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invite:create-test {email} {--role=user} {--days=7}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test invite for development purposes';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $role = $this->option('role');
        $days = (int) $this->option('days');

        $invite = Invite::create([
            'email' => $email,
            'role' => $role,
            'expires_at' => now()->addDays($days),
            'invited_by' => 'console',
        ]);

        $this->info('Test invite created successfully!');
        $this->info("Email: {$invite->email}");
        $this->info("Role: {$invite->role}");
        $this->info("Invite Code: {$invite->invite_code}");
        $this->info("Expires: {$invite->expires_at}");
        $this->info('URL: '.route('invite.validation'));

        return Command::SUCCESS;
    }
}
