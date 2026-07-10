<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'samuel.pineda@sumimedical.com'],
            [
                'name' => 'Samuel Pineda',
                'password' => 'Sumi1234',
                'is_admin' => true,
            ]
        );
    }
}
