<?php
include_once("database.php");

$contact_id = $_POST['edit_contact_real_id'];
$group_id = $_POST['edit_contact_group'];
$first_name = mysql_real_escape_string($_POST['edit_contact_first_name'], $conn);
$last_name = mysql_real_escape_string($_POST['edit_contact_last_name'], $conn);
$email_address = mysql_real_escape_string($_POST['edit_contact_email_address'], $conn);
$home_phone = mysql_real_escape_string($_POST['edit_contact_home_phone'], $conn);
$work_phone = mysql_real_escape_string($_POST['edit_contact_work_phone'], $conn);
$twitter = mysql_real_escape_string($_POST['edit_contact_twitter'], $conn);
$facebook = mysql_real_escape_string($_POST['edit_contact_facebook'], $conn);
$linkedin = mysql_real_escape_string($_POST['edit_contact_linkedin'], $conn);

$sql = "";
if(strlen($contact_id) > 0) {	
	$sql = "UPDATE contacts SET group_id = ".$group_id.", first_name = '".$first_name."', last_name = '".$last_name."', "
		. " email_address = '".$email_address."', home_phone = '".$home_phone."', work_phone = '".$work_phone."', "
		. " twitter = '".$twitter."', facebook = '".$facebook."', linkedin = '".$linkedin."' WHERE id = ".$contact_id;
} else {
	$sql = "INSERT INTO contacts(group_id, first_name, last_name, email_address, home_phone, work_phone, twitter, "
		. " facebook, linkedin) VALUES(".$group_id.", '".$first_name."', '".$last_name."', '".$email_address."', "
		. " '".$home_phone."', '".$work_phone."', '".$twitter."', '".$facebook."', '".$linkedin."')";
}
$result = mysql_query($sql) or die("Could not edit contact in database");
if(mysql_affected_rows() > 0 && $_POST['edit_contact_ajax'] == "0") {
	header("Location: ../index.html");
} else {
	header('Content-Type: application/json; charset=utf8');
	$data = array();
	if(mysql_affected_rows() > 0) {
		$data['success'] = true;
		if(strlen($contact_id) > 0) { 
			$data['new_contact'] = false;
			$data['id'] = $contact_id;
		} else {
			$data['new_contact'] = true;
			$data['id'] = mysql_insert_id();
		}
		$data['name'] = $first_name+" "+$last_name;
	} else {
		$data['success'] = false;
		$data['new_contact'] = (strlen($contact_id) < 1);
		$data['error'] = 'Error: could not edit contact in database';
	}
	echo json_encode($data);
}
?>