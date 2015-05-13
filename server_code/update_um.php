<?php
header("Content-Type: application/json;charset=utf-8");
include_once 'db_connect.php';
session_start();
$_SESSION['user'] = 'test';

function renderGenericResult($query, $errorName) {
    if($query) {
        echo json_encode(array(
            'result' => 'OK'
        ));
    } else {
        echo json_encode(array(
            'result' => 'ERR',
            'error' => $errorName,
            'description' => 'A valid query could not be produced with the entered data or the database had not such registry',
        ));
    }
}

function getVariable($array, $name) {
    global $db;
    if(isset($array[$name])) {
        return $db -> real_escape_string($array[$name]);
    }
    return null;
}

function getPost($name) {
    return getVariable($_POST, $name);
}

function getSession($name) {
    return getVariable($_SESSION, $name);
}

function addItem() {
    global $db;
    $name = getPost('name');
    $type = getPost('type');
    $value = getPost('value');
    $url = getPost('url');
    $use = getPost('use');
    $user = getSession('user');
    $query = $db -> query("INSERT INTO data(user, name, type, value, url, use) VALUES ('$user', '$name', '$type', '$value', '$url', '$use)");
    renderGenericResult($query, 'ADD_SINGLE_ERROR');
}

function removeItem() {
    global $db;
    $name = getPost('name');
    $user = getSession('user');
    $query = $db -> query("DELETE FROM data WHERE user = '$user' AND name = '$name'");
    renderGenericResult($query, 'REMOVE_SINGLE_ERROR');
}

function updateItem() {
    global $db;
    $name = getPost('name');
    $valueName = getPost('valueName');
    $newValue = getPost('newValue');
    $user = getSession('user');
    $query = $db -> query("UPDATE data SET $valueName = '$newValue' WHERE user = '$user' AND name = '$name'");
    renderGenericResult($query, 'UPDATE_SINGLE_ERROR');
}

function getItem() {
    global $db;
    $name = getPost('name');
    $user = getSession('user');
    $query = $db -> query("SELECT type, value, url, use FROM data WHERE user = '$user' AND name = '$name' LIMIT 1");
    if($query && $query -> num_rows == 1) {
        $row = $query -> fetch_object();
        echo json_encode(array(
            'result' => 'OK',
            'name' => $name,
            'user' => $user,
            'type' => $row -> type,
            'value' => $row -> value,
            'url' => $row -> url
        ));
    } else {
        echo json_encode(array(
            'result' => 'ERR',
            'error' => 'GET_SINGLE_ERROR',
            'description' => 'A valid query could not be produced with the entered data or the database had not such registry',
        ));
    }
}

$functions = array('addItem', 'removeItem', 'updateItem', 'getItem');

$functionName = getPost('method');
if(in_array($functionName, $functions)) {
    call_user_func($functionName);
} else {
    echo json_encode(array(
        'result' => 'ERR',
        'error' => 'INVALID_FUNCTION',
        'description' => "'$functionName' is not a valid function, please use on of the following functions in the POST request: " . implode(', ', $functions)
    ));
}
?>