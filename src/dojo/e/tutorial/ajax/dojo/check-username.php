<?php
$usernames = array("dojo","sitepen");
if (in_array($_GET['username'],$usernames)) die('0');
else die('available');
?>