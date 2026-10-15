<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

$pdo = Database::connection();
$email = 'auth-smoke-' . bin2hex(random_bytes(6)) . '@example.test';
$password = 'TestPassword123';

$pdo->beginTransaction();
try {
    $statement = $pdo->prepare(
        "INSERT INTO users (full_name, email, password_hash, role, status)
         VALUES (?, ?, ?, 'Staff', 'Active')"
    );
    $statement->execute(['Auth Smoke Test', $email, password_hash($password, PASSWORD_DEFAULT)]);

    $statement = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $statement->execute([$email]);
    $user = $statement->fetch();

    assert($user !== false);
    assert($user['password_hash'] !== $password);
    assert(password_verify($password, $user['password_hash']));
    assert($user['role'] === 'Staff');
    assert($user['status'] === 'Active');

    startAppSession();
    signInUser($user, false);
    assert(currentUser()['id'] === (int) $user['id']);
    assert(validCsrfToken(csrfToken()));
    signOutUser();

    echo "Authentication database and session checks passed.\n";
} finally {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
}
