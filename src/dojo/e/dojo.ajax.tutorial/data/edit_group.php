<?php
include_once("database.php");

$group_id = $_POST['edit_group_id'];
$group_name = $_POST['edit_group_name'];

$sql = "UPDATE groups SET name = '".mysql_real_escape_string($group_name, $conn)."' WHERE id = ".mysql_real_escape_string($group_id, $conn);
$result = mysql_query($sql) or die("Could not rename group in database");
if(mysql_affected_rows() > 0 && $_POST['edit_group_ajax'] == "0") {
	header("Location: ../index.html");
} else {
	header('Content-Type: application/json; charset=utf8');
	$data = array();
	if(mysql_affected_rows() > 0) {
		$data['success'] = true;
		$data['id'] = $group_id;
		$data['name'] = $group_name;
	} else {
		$data['success'] = false;
		$data['error'] = 'Error: could not rename group in database';
	}
	echo json_encode($data);
}
?>