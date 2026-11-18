<?php
declare(strict_types=1);

const QUIZ_LENGTH = 3;
$sessionReady = session_start(['use_strict_mode' => 1, 'cookie_httponly' => 1, 'cookie_samesite' => 'Lax']);
header('Cache-Control: no-store');
$problem = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $score = filter_input(INPUT_POST, 'score', FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => QUIZ_LENGTH]
    ]);
    $total = filter_input(INPUT_POST, 'total', FILTER_VALIDATE_INT);
    if (!is_int($score) || $total !== QUIZ_LENGTH) {
        http_response_code(422);
        $problem = 'This result is incomplete. Take the quiz again to record a score.';
    } elseif (!$sessionReady) {
        http_response_code(503);
        $problem = 'Score storage is unavailable. Please try saving again later.';
    } else {
        $_SESSION['orbit_last'] = $score;
        $_SESSION['orbit_best'] = max($score, (int) ($_SESSION['orbit_best'] ?? 0));
        session_write_close();
    }

    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($problem === '' ? ['saved' => true] : ['saved' => false, 'message' => $problem]);
        exit;
    }
    if ($problem === '') {
        header('Location: orbit.php', true, 303);
        exit;
    }
}

$hasResult = $problem === '' && isset($_SESSION['orbit_last']);
$title = $problem !== '' ? 'Score unavailable.' : ($hasResult ? 'Score recorded.' : 'Your flight log.');
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#080b12">
    <title>Quiz flight log — ORBIT</title>
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="orbit.css">
</head>
<body class="receipt-page">
    <header class="masthead"><div class="shell receipt-head">
        <a class="brand" href="orbit.html" aria-label="ORBIT home">
            <svg viewBox="0 0 48 42" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8"><circle cx="24" cy="21" r="12.4"/><path d="M35 10c5.5-1.5 9-1.4 9.7.3 1.4 3.3-6.7 10.5-18.1 16.2S4.7 34.5 3.3 31.2c-.9-2.2 2.8-6.6 9-11"/></svg><span>ORBIT</span>
        </a>
        <a class="return-top" href="orbit.html">Back to observatory <span aria-hidden="true">↗</span></a>
    </div></header>
    <main class="receipt-main">
        <article class="receipt">
            <p class="eyebrow"><span class="section-line"></span>Space quiz</p>
            <h1><?= $title ?></h1>
            <?php if ($hasResult): ?>
                <p class="receipt-score"><?= (int) $_SESSION['orbit_last'] ?> <span>/ <?= QUIZ_LENGTH ?></span></p>
                <p><?= $_SESSION['orbit_last'] === QUIZ_LENGTH ? 'Every answer correct. ' : '' ?>Your best this session is <?= (int) $_SESSION['orbit_best'] ?> out of <?= QUIZ_LENGTH ?>.</p>
            <?php else: ?>
                <p><?= $problem !== '' ? $problem : 'Complete the three-question space quiz to enter your first score.' ?></p>
            <?php endif; ?>
            <a class="action primary" href="orbit.html#quiz"><?= $hasResult ? 'Play again' : 'Go to quiz' ?> <span aria-hidden="true">→</span></a>
        </article>
    </main>
</body>
</html>
