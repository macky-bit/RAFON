<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
startAppSession();
requireAuthenticatedUser();

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestPayload(): array
{
    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) {
        respond(['error' => 'The request body must contain valid JSON.'], 400);
    }
    return $payload;
}

function validDate(string $date): bool
{
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    return $parsed !== false && $parsed->format('Y-m-d') === $date;
}

function cleanText(array $payload, string $key, string $label, int $maxLength, bool $required = true): string
{
    $value = trim((string) ($payload[$key] ?? ''));
    if ($required && $value === '') {
        respond(['error' => "{$label} is required."], 422);
    }
    if (mb_strlen($value) > $maxLength) {
        respond(['error' => "{$label} must not exceed {$maxLength} characters."], 422);
    }
    return $value;
}

function eventRecord(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'eventName' => $row['event_name'],
        'clientName' => $row['client_name'],
        'packageName' => $row['package_name'],
        'eventDate' => $row['event_date'],
        'status' => $row['status'],
        'totalRevenue' => (float) $row['total_revenue'],
        'estimatedCost' => (float) $row['estimated_cost'],
        'amountPaid' => (float) $row['amount_paid'],
        'notes' => $row['notes'] ?? '',
    ];
}

function findEvent(PDO $pdo, int $id): array
{
    $statement = $pdo->prepare('SELECT * FROM catering_events WHERE id = ? AND deleted_at IS NULL');
    $statement->execute([$id]);
    $event = $statement->fetch();
    if (!$event) {
        respond(['error' => 'Catering event not found.'], 404);
    }
    return eventRecord($event);
}

function validatedEvent(array $payload): array
{
    $eventDate = trim((string) ($payload['eventDate'] ?? ''));
    if (!validDate($eventDate)) {
        respond(['error' => 'A valid event date is required.'], 422);
    }

    $status = trim((string) ($payload['status'] ?? 'Upcoming'));
    if (!in_array($status, ['Upcoming', 'Completed', 'Cancelled'], true)) {
        respond(['error' => 'Choose a valid event status.'], 422);
    }

    $totalRevenue = round((float) ($payload['totalRevenue'] ?? 0), 2);
    $estimatedCost = round((float) ($payload['estimatedCost'] ?? 0), 2);
    $amountPaid = round((float) ($payload['amountPaid'] ?? 0), 2);
    if ($totalRevenue < 0 || $estimatedCost < 0 || $amountPaid < 0) {
        respond(['error' => 'Revenue, cost, and amount paid cannot be negative.'], 422);
    }

    return [
        cleanText($payload, 'eventName', 'Event name', 150),
        cleanText($payload, 'clientName', 'Client name', 150),
        cleanText($payload, 'packageName', 'Package name', 120),
        $eventDate,
        $status,
        $totalRevenue,
        $estimatedCost,
        $amountPaid,
        cleanText($payload, 'notes', 'Notes', 500, false),
    ];
}

try {
    $pdo = Database::connection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $rows = $pdo->query('SELECT * FROM catering_events WHERE deleted_at IS NULL ORDER BY event_date DESC, id DESC')->fetchAll();
        respond(['events' => array_map('eventRecord', $rows)]);
    }

    $payload = requestPayload();

    if ($method === 'POST') {
        $values = validatedEvent($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'INSERT INTO catering_events
                (event_name, client_name, package_name, event_date, status, total_revenue, estimated_cost, amount_paid, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute($values);
        $id = (int) $pdo->lastInsertId();
        $log = $pdo->prepare(
            'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
        );
        $log->execute(['System User', 'Created Catering Event', 'EVENT-' . $id, $values[0] . ' / ' . $values[2], 'VERIFIED']);
        $pdo->commit();
        respond(['event' => findEvent($pdo, $id)], 201);
    }

    $id = (int) ($payload['id'] ?? 0);
    if ($id <= 0) {
        respond(['error' => 'A valid catering event ID is required.'], 422);
    }
    findEvent($pdo, $id);

    if ($method === 'PUT') {
        $values = validatedEvent($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'UPDATE catering_events SET event_name = ?, client_name = ?, package_name = ?, event_date = ?,
             status = ?, total_revenue = ?, estimated_cost = ?, amount_paid = ?, notes = ? WHERE id = ?'
        );
        $statement->execute([...$values, $id]);
        $log = $pdo->prepare(
            'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
        );
        $log->execute(['System User', 'Updated Catering Event', 'EVENT-' . $id, $values[0] . ' / ' . $values[2], 'VERIFIED']);
        $pdo->commit();
        respond(['event' => findEvent($pdo, $id)]);
    }

    if ($method === 'DELETE') {
        $pdo->beginTransaction();
        $statement = $pdo->prepare('UPDATE catering_events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL');
        $statement->execute([$id]);
        $log = $pdo->prepare(
            'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
        );
        $log->execute(['System User', 'Deleted Catering Event', 'EVENT-' . $id, 'Catering event record removed', 'VERIFIED']);
        $pdo->commit();
        respond(['deletedId' => $id]);
    }

    header('Allow: GET, POST, PUT, DELETE');
    respond(['error' => 'Method not allowed.'], 405);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'The catering event request could not be completed. Run the latest database schema first.'], 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'An unexpected server error occurred.'], 500);
}
