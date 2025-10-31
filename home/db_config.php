<?php
// db_config.php
$servername = "localhost";
$username = "baobabwo_baobabuserz";
$password = "2vJFxdPNTHx,";
$dbname = "baobabwo_baobabproducts";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
