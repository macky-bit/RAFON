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

function cleanText(array $payload, string $key, string $label, int $maxLength, bool $required = false): string
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

function supplierRecord(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'businessName' => $row['business_name'],
        'category' => $row['category'],
        'contactPerson' => $row['contact_person'] ?? '',
        'phone' => $row['phone'] ?? '',
        'email' => $row['email'] ?? '',
        'address' => $row['address'] ?? '',
        'productsSupplied' => $row['products_supplied'] ?? '',
        'deliveryDays' => $row['delivery_days'] ?? '',
        'leadTimeDays' => $row['lead_time_days'] === null ? null : (int) $row['lead_time_days'],
        'minimumOrder' => (float) $row['minimum_order'],
        'isPreferred' => (bool) $row['is_preferred'],
        'status' => $row['status'],
        'notes' => $row['notes'] ?? '',
        'updatedAt' => $row['updated_at'],
    ];
}

function findSupplier(PDO $pdo, int $id): array
{
    $statement = $pdo->prepare('SELECT * FROM suppliers WHERE id = ?');
    $statement->execute([$id]);
    $supplier = $statement->fetch();
    if (!$supplier) {
        respond(['error' => 'Supplier not found.'], 404);
    }
    return supplierRecord($supplier);
}

function validatedSupplier(array $payload): array
{
    $email = cleanText($payload, 'email', 'Email', 190);
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        respond(['error' => 'Enter a valid email address.'], 422);
    }

    $leadTimeValue = $payload['leadTimeDays'] ?? null;
    $leadTimeDays = $leadTimeValue === '' || $leadTimeValue === null ? null : filter_var($leadTimeValue, FILTER_VALIDATE_INT);
    if ($leadTimeDays === false || ($leadTimeDays !== null && ($leadTimeDays < 0 || $leadTimeDays > 365))) {
        respond(['error' => 'Lead time must be between 0 and 365 days.'], 422);
    }

    $minimumOrder = round((float) ($payload['minimumOrder'] ?? 0), 2);
    if ($minimumOrder < 0) {
        respond(['error' => 'Minimum order cannot be negative.'], 422);
    }

    $status = trim((string) ($payload['status'] ?? 'Active'));
    if (!in_array($status, ['Active', 'Inactive'], true)) {
        respond(['error' => 'Choose a valid supplier status.'], 422);
    }

    return [
        cleanText($payload, 'businessName', 'Business name', 150, true),
        cleanText($payload, 'category', 'Category', 100, true),
        cleanText($payload, 'contactPerson', 'Contact person', 150),
        cleanText($payload, 'phone', 'Phone', 50),
        $email,
        cleanText($payload, 'address', 'Address', 300),
        cleanText($payload, 'productsSupplied', 'Products supplied', 500),
        cleanText($payload, 'deliveryDays', 'Delivery days', 150),
        $leadTimeDays,
        $minimumOrder,
        filter_var($payload['isPreferred'] ?? false, FILTER_VALIDATE_BOOL),
        $status,
        cleanText($payload, 'notes', 'Notes', 1000),
    ];
}

function writeAuditLog(PDO $pdo, string $action, int $id, string $detail): void
{
    $statement = $pdo->prepare(
        'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
    );
    $statement->execute(['System User', $action, 'SUPPLIER-' . $id, $detail, 'VERIFIED']);
}

try {
    $pdo = Database::connection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $rows = $pdo->query(
            "SELECT * FROM suppliers
             ORDER BY status = 'Active' DESC, is_preferred DESC, business_name ASC, id DESC"
        )->fetchAll();
        respond(['suppliers' => array_map('supplierRecord', $rows)]);
    }

    $payload = requestPayload();

    if ($method === 'POST') {
        $values = validatedSupplier($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'INSERT INTO suppliers
                (business_name, category, contact_person, phone, email, address, products_supplied,
                 delivery_days, lead_time_days, minimum_order, is_preferred, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute($values);
        $id = (int) $pdo->lastInsertId();
        writeAuditLog($pdo, 'Created Supplier', $id, $values[0] . ' / ' . $values[1]);
        $pdo->commit();
        respond(['supplier' => findSupplier($pdo, $id)], 201);
    }

    $id = (int) ($payload['id'] ?? 0);
    if ($id <= 0) {
        respond(['error' => 'A valid supplier ID is required.'], 422);
    }
    $existing = findSupplier($pdo, $id);

    if ($method === 'PUT') {
        $values = validatedSupplier($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'UPDATE suppliers SET business_name = ?, category = ?, contact_person = ?, phone = ?, email = ?,
             address = ?, products_supplied = ?, delivery_days = ?, lead_time_days = ?, minimum_order = ?,
             is_preferred = ?, status = ?, notes = ?, archived_at = CASE WHEN ? = \'Inactive\' THEN COALESCE(archived_at, CURRENT_TIMESTAMP) ELSE NULL END
             WHERE id = ?'
        );
        $statement->execute([...$values, $values[11], $id]);
        writeAuditLog($pdo, 'Updated Supplier', $id, $values[0] . ' / ' . $values[1]);
        $pdo->commit();
        respond(['supplier' => findSupplier($pdo, $id)]);
    }

    if ($method === 'PATCH') {
        $status = trim((string) ($payload['status'] ?? ''));
        if (!in_array($status, ['Active', 'Inactive'], true)) {
            respond(['error' => 'Choose Active or Inactive supplier status.'], 422);
        }
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            "UPDATE suppliers SET status = ?, archived_at = CASE WHEN ? = 'Inactive' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?"
        );
        $statement->execute([$status, $status, $id]);
        writeAuditLog($pdo, $status === 'Inactive' ? 'Archived Supplier' : 'Reactivated Supplier', $id, $existing['businessName']);
        $pdo->commit();
        respond(['supplier' => findSupplier($pdo, $id)]);
    }

    header('Allow: GET, POST, PUT, PATCH');
    respond(['error' => 'Method not allowed.'], 405);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'The supplier request could not be completed. Run the latest database schema first.'], 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'An unexpected server error occurred.'], 500);
}
