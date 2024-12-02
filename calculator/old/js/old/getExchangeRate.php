<?php
// config.php
$botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ";
$chatId = "-413166690";

// Функция для выполнения запроса к Telegram API
function fetchChatData($botToken, $chatId) {
    $url = "https://api.telegram.org/bot{$botToken}/getChat?chat_id={$chatId}";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

// Функция для извлечения курса из имени группы
function parseCurrency($groupName, $multiplier = 7.3) {
    if (preg_match('/курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i', $groupName, $matches)) {
        $currencyYuan = floatval(str_replace(',', '.', $matches[2]));
        $currencyDollar = round($currencyYuan * $multiplier, 2);
        return [
            'currencyYuan' => number_format($currencyYuan, 2, '.', ''),
            'currencyDollar' => number_format($currencyDollar, 2, '.', '')
        ];
    }
    return null;
}

// Основная логика
$chatData = fetchChatData($botToken, $chatId);

if ($chatData && $chatData['ok']) {
    $groupName = $chatData['result']['title'];
    $currencies = parseCurrency($groupName);

    if ($currencies) {
        echo json_encode($currencies); // Возвращаем JSON с курсами
    } else {
        echo json_encode(['error' => 'Не удалось извлечь курсы из имени группы']);
    }
} else {
    echo json_encode(['error' => 'Ошибка запроса к Telegram API']);
}
?>