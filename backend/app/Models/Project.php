<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'status',
        'owner_id',
        'invite_code',
        'invite_enabled',
    ];

    protected function casts(): array
    {
        return [
            'invite_enabled' => 'boolean',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($project) {
            if (!$project->invite_code) {
                $project->invite_code = \Illuminate\Support\Str::random(16);
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('sort_order');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }
}
