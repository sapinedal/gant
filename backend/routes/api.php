<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectInviteController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/invitations/{token}', [InvitationController::class, 'show']);
Route::get('/invitations/project/{invite_code}', [ProjectInviteController::class, 'preview']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept']);
    Route::post('/invitations/project/{invite_code}/accept', [ProjectInviteController::class, 'join']);

    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/members', [ProjectController::class, 'members']);
    Route::post('/projects/{project}/invite', [ProjectController::class, 'invite']);
    Route::delete('/projects/{project}/members/{userId}', [ProjectController::class, 'removeMember']);
    Route::patch('/projects/{project}/members/{userId}', [ProjectController::class, 'updateMemberRole']);
    Route::post('/projects/{project}/invite-link/enable', [ProjectController::class, 'enableInviteLink']);
    Route::post('/projects/{project}/invite-link/disable', [ProjectController::class, 'disableInviteLink']);
    Route::post('/projects/{project}/invite-link/reset', [ProjectController::class, 'resetInviteLink']);

    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class)->except(['show']);
        Route::get('/admin/projects', [ProjectController::class, 'allProjectsForAdmin']);
        Route::get('/admin/users/{user}/projects', [UserController::class, 'projects']);
        Route::post('/admin/users/{user}/projects', [UserController::class, 'attachProject']);
        Route::put('/admin/users/{user}/projects/{project}', [UserController::class, 'updateProjectRole']);
        Route::delete('/admin/users/{user}/projects/{project}', [UserController::class, 'detachProject']);
    });
});

