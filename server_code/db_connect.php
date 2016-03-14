<?php
	$host = '127.0.0.1';
	$user = 'root';
	$password = '';
	$database = 'test';
	$port = '3306';
	$db = new mysqli($host, $user, $password, $database, $port) or die('error with connection');
?>