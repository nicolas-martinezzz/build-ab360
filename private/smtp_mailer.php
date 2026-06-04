<?php
// smtp_mailer.php — replaces PHP mail() using direct SMTP socket to Postfix localhost:25.
// Needed because sendmail_path in php.ini points to a missing binary (/var/qmail/plugins/rate_from_php).
// Include this file before any yutopias_mail() call.

function yutopias_mail(string $to, string $subject, string $body, string $additionalHeaders): bool {
    $smtpHost = '127.0.0.1';
    $smtpPort = 25;
    $domain   = 'yutopias.com';

    // Parse From address out of the headers string.
    $from = 'no-reply@yutopias.com';
    foreach (preg_split('/\r\n|\r|\n/', $additionalHeaders) as $line) {
        if (stripos($line, 'From:') === 0) {
            $val = trim(substr($line, 5));
            if (preg_match('/<([^>@\s]+@[^>@\s]+)>/', $val, $m)) {
                $from = $m[1];
            } elseif (filter_var($val, FILTER_VALIDATE_EMAIL)) {
                $from = $val;
            }
            break;
        }
    }

    // Recipients — comma-separated, strip display names.
    $recipientList = [];
    foreach (array_filter(array_map('trim', explode(',', $to))) as $rcpt) {
        if (preg_match('/<([^>@\s]+@[^>@\s]+)>/', $rcpt, $m)) {
            $recipientList[] = $m[1];
        } elseif (filter_var($rcpt, FILTER_VALIDATE_EMAIL)) {
            $recipientList[] = $rcpt;
        }
    }
    if (empty($recipientList)) return false;

    $fp = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 10);
    if (!$fp) return false;
    stream_set_timeout($fp, 10);

    $readResp = static function () use ($fp): string {
        $resp = '';
        while (!feof($fp)) {
            $line = fgets($fp, 512);
            if ($line === false) break;
            $resp .= $line;
            // Multi-line: "250-" continues, "250 " ends.
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $resp;
    };

    $cmd = static function (string $line) use ($fp, $readResp): string {
        fwrite($fp, $line . "\r\n");
        return $readResp();
    };

    $readResp(); // greeting
    $cmd("EHLO $domain");
    $cmd("MAIL FROM:<$from>");
    foreach ($recipientList as $rcpt) {
        $cmd("RCPT TO:<$rcpt>");
    }
    $cmd("DATA");

    // Full RFC 2822 message.
    $message  = "To: $to\r\n";
    $message .= "Subject: $subject\r\n";
    $message .= rtrim($additionalHeaders, "\r\n") . "\r\n";
    $message .= "\r\n";
    // Escape lines that start with a dot (RFC 2821 transparency).
    $message .= preg_replace('/^\./', '..', $body, -1, $count);
    $message .= "\r\n";
    fwrite($fp, $message);

    $resp = $cmd(".");
    $cmd("QUIT");
    fclose($fp);

    return strpos($resp, '250') !== false;
}
