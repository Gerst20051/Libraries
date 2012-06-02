<?php
include_once("database.php");

$group_id = $_POST['group_id'];
$sql = "DELETE FROM groups WHERE id = ".mysql_real_escape_string($group_id, $conn);
$result = mysql_query($sql) or die("Could not delete group from database");

$data = array();
if(mysql_affected_rows() > 0) {
	header('Content-Type: application/json; charset=utf8');
	$data['success'] = true;
} else {
	$data['success'] = false;
	$data['error'] = 'Error: could not delete group from database';
}

echo json_encode($data);
?>