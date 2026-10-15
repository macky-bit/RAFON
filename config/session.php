<?php

declare(strict_types=1);

function startAppSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('rafon_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
    $_SESSION['csrf_token'] ??= bin2hex(random_bytes(32));
}

function csrfToken(): string
{
    return (string) ($_SESSION['csrf_token'] ?? '');
}

function currentUser(): ?array
{
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

function requireAuthenticatedUser(): array
{
    $user = currentUser();
    if ($user !== null) {
        return $user;
    }

    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => 'Authentication required.']);
    exit;
}

function validCsrfToken(string $token): bool
{
    return $token !== '' && hash_equals(csrfToken(), $token);
}

function signInUser(array $row, bool $remember): void
{
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int) $row['id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'role' => $row['role'],
    ];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    if ($remember) {
        $params = session_get_cookie_params();
        setcookie(session_name(), session_id(), [
            'expires' => time() + 60 * 60 * 24 * 30,
            'path' => $params['path'],
            'secure' => $params['secure'],
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}

function signOutUser(): void
{
    $_SESSION = [];
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 3600,
        'path' => $params['path'],
        'secure' => $params['secure'],
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_destroy();
}
