<?php
echo "The server received:\n\n";
foreach($_POST as $key=>$val) {
	echo "$key is: ".print_r($val,true)." \n";
}
?>