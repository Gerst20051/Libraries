<?php
include_once("database.php");
//SQL statement to get all groups
$sql = "SELECT id, name, 'node' as type FROM groups ORDER BY id";
$result = mysql_query($sql, $conn) or die("Could not load groups");

//Always show "Groups" as root element
$data = array(
	'identifier' => 'id',
	'label' => 'name',
	'items' => array(
		array(
			'id' => 0,
			'name' => 'Groups',
			'type' => 'root'
		)
	)
);

//Retrieve groups and add to array
if(mysql_num_rows($result) > 0) {
	while($row = mysql_fetch_assoc($result)) {
		$data['items'][0]['groups'][] = array('_reference' => $row['id']);
		$data['items'][] = $row;
	}
}

//Output $data array as JSON
header('Content-Type: application/json; charset=utf8');
echo json_encode($data);
?>