<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

startAppSession();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function authRespond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function authPayload(): array
{
    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) {
        authRespond(['error' => 'The request body must contain valid JSON.'], 400);
    }
    return $payload;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        authRespond(['user' => currentUser(), 'csrfToken' => csrfToken()]);
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: GET, POST');
        authRespond(['error' => 'Method not allowed.'], 405);
    }

    $payload = authPayload();
    if (!validCsrfToken((string) ($payload['csrfToken'] ?? ''))) {
        authRespond(['error' => 'Your session expired. Reload the page and try again.'], 419);
    }

    $action = (string) ($payload['action'] ?? '');
    if ($action === 'logout') {
        signOutUser();
        authRespond(['ok' => true]);
    }

    $pdo = Database::connection();
    $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
    $password = (string) ($payload['password'] ?? '');

    if ($action === 'register') {
        $fullName = trim((string) ($payload['full_name'] ?? ''));
        $confirmation = (string) ($payload['password_confirmation'] ?? '');
        if (mb_strlen($fullName) < 2 || mb_strlen($fullName) > 100) {
            authRespond(['error' => 'Full name must be between 2 and 100 characters.'], 422);
        }
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || mb_strlen($email) > 190) {
            authRespond(['error' => 'Enter a valid email address.'], 422);
        }
        if (strlen($password) < 8 || strlen($password) > 72) {
            authRespond(['error' => 'Password must be between 8 and 72 characters.'], 422);
        }
        if (!hash_equals($password, $confirmation)) {
            authRespond(['error' => 'Passwords must match.'], 422);
        }
        if (($payload['terms'] ?? false) !== true) {
            authRespond(['error' => 'You must accept the account and data-use policy.'], 422);
        }

        $statement = $pdo->prepare(
            "INSERT INTO users (full_name, email, password_hash, role, status)
             VALUES (?, ?, ?, 'Staff', 'Active')"
        );
        $statement->execute([$fullName, $email, password_hash($password, PASSWORD_DEFAULT)]);
        authRespond(['message' => 'Account created. Sign in to continue.'], 201);
    }

    if ($action !== 'login') {
        authRespond(['error' => 'Unknown authentication action.'], 400);
    }
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || $password === '') {
        authRespond(['error' => 'Enter your email address and password.'], 422);
    }

    $statement = $pdo->prepare(
        'SELECT id, full_name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1'
    );
    $statement->execute([$email]);
    $user = $statement->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        authRespond(['error' => 'Invalid email address or password.'], 401);
    }
    if ($user['status'] !== 'Active') {
        authRespond(['error' => 'This account is not active. Contact an administrator.'], 403);
    }

    signInUser($user, (bool) ($payload['remember'] ?? false));
    $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$user['id']]);
    authRespond(['user' => currentUser(), 'csrfToken' => csrfToken()]);
} catch (PDOException $exception) {
    if ((string) $exception->getCode() === '23000') {
        authRespond(['error' => 'An account already exists for that email address.'], 409);
    }
    error_log($exception->getMessage());
    authRespond(['error' => 'The authentication request could not be completed.'], 500);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    authRespond(['error' => 'An unexpected authentication error occurred.'], 500);
}
