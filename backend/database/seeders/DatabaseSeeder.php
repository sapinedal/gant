<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * El usuario administrador inicial se configura por variables de entorno
     * (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME) para no dejar credenciales
     * reales en el código fuente. Si no se define ADMIN_PASSWORD, se genera
     * una aleatoria y se imprime una sola vez en la consola.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');

        if (! $email) {
            $this->command?->warn('ADMIN_EMAIL no está definido: se omite la creación del usuario administrador.');

            return;
        }

        $password = env('ADMIN_PASSWORD') ?: Str::password(16);

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_NAME', 'Administrador'),
                'password' => $password,
                'is_admin' => true,
            ]
        );

        if (! env('ADMIN_PASSWORD')) {
            $this->command?->warn("Usuario administrador '{$email}' creado con contraseña generada: {$password}");
        } else {
            $this->command?->info("Usuario administrador '{$email}' creado/actualizado.");
        }
    }
}
