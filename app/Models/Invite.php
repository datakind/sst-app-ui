<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invite extends Model
{
    /** @use HasFactory<\Illuminate\Database\Eloquent\Factories\Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'email',
        'invite_code',
        'role',
        'institution_id',
        'expires_at',
        'is_used',
        'used_at',
        'invited_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Generate a unique invite code
     */
    public static function generateInviteCode(): string
    {
        do {
            $code = Str::random(32);
        } while (static::where('invite_code', $code)->exists());

        return $code;
    }

    /**
     * Check if invite is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if invite is valid (not used and not expired)
     */
    public function isValid(): bool
    {
        return ! $this->is_used && ! $this->isExpired();
    }

    /**
     * Mark invite as used
     */
    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    /**
     * Get the user who sent this invite
     *
     * @return BelongsTo<User, $this>
     */
    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Scope for valid invites
     */
    /**
     * @param  Builder<Invite>  $query
     */
    public function scopeValid(Builder $query): mixed
    {
        return $query->where('is_used', false)
            ->where('expires_at', '>', now());
    }

    /**
     * Scope for expired invites
     */
    /**
     * @param  Builder<Invite>  $query
     */
    public function scopeExpired(Builder $query): mixed
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope for unused invites
     */
    /**
     * @param  Builder<Invite>  $query
     */
    public function scopeUnused(Builder $query): mixed
    {
        return $query->where('is_used', false);
    }

    /**
     * Boot method to set default values
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invite) {
            if (empty($invite->invite_code)) {
                $invite->invite_code = static::generateInviteCode();
            }

            if (empty($invite->expires_at)) {
                $invite->expires_at = now()->addDays(7); // Default 7 days
            }
        });
    }
}
