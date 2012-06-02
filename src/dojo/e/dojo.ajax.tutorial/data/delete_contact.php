<?php
include_once("database.php");

$contact_id = $_POST['contact_id'];
$sql = "DELETE FROM contacts WHERE id = ".mysql_real_escape_string($contact_id, $conn);
$result = mysql_query($sql) or die("Could not delete contact from database");

$data = array();
if(mysql_affected_rows() > 0) {
	header('Content-Type: application/json; charset=utf8');
	$data['success'] = true;
} else {
	$data['success'] = false;
	$data['error'] = 'Error: could not delete contact from database';
}

echo json_encode($data);
?>