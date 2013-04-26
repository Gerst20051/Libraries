<?php
$db_host = "localhost";
$db_user = "dojo";
$db_pass = "somepass";
$db_name = "dojocontacts";

//Connect to MySQL
$conn = mysql_connect($db_host, $db_user, $db_pass);
//Select database
mysql_select_db($db_name, $conn);
?>