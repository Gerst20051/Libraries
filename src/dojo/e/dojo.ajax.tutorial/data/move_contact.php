<?php
include_once("database.php");
//Get form values
$contact_id = $_POST['move_contact_id'];
$group_id = $_POST['move_contact_new'];
//Perform update
$sql = "UPDATE contacts SET group_id = ".mysql_real_escape_string($group_id, $conn)." WHERE id = ".mysql_real_escape_string($contact_id);
$result = mysql_query($sql) or die("Could not move contact in database");
//Check if performed via Ajax
if(mysql_affected_rows() > 0 && $_POST['move_contact_ajax'] == "0") {
	header("Location: ../index.html");
} else {
	//If Ajax, return JSON response
	header('Content-Type: application/json; charset=utf8');
	$data = array();
	//If rows affected, change was successful
	if(mysql_affected_rows() > 0) {
		$data['success'] = true;
		$data['id'] = $contact_id;
	} else {
		$data['success'] = false;
		$data['error'] = 'Error: could not move contact in database';
	}
	//Output array in JSON format
	echo json_encode($data);
}
?>