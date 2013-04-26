<?php
include_once("database.php");

$sql = "SELECT * FROM contacts WHERE id = ".mysql_real_escape_string($_GET['contact_id'], $conn);
$result = mysql_query($sql, $conn) or die("Could not load contact");

$contact = array();

if(mysql_num_rows($result) > 0) {
	while($row = mysql_fetch_assoc($result)) {
		$contact = $row;
	}
}
?>

<h2><?php echo $contact['first_name'].' '.$contact['last_name']; ?></h2>
<hr />
<table id="contactDetail" cellpadding="4" cellspacing="4">
	<colgroup>
		<col width="140" />
		<col />
	</colgroup>
	<tbody>
		<tr>
			<th>Email Address</th>
			<td><a href="mailto:<?php echo $contact['email_address']; ?>"><?php echo $contact['email_address']; ?></a></td>
		</tr>

		<!-- Home phone, if available -->
		<?php if(strlen($contact['home_phone']) > 0): ?>
		<tr>
			<th>Home Phone</th>
			<td><?php echo $contact['home_phone']; ?></td>
		</tr>
		<?php endif; ?>

		<!-- Work phone, if available -->
		<?php if(strlen($contact['work_phone']) > 0): ?>
		<tr>
			<th>Work Phone</th>
			<td><?php echo $contact['work_phone']; ?></td>
		</tr>
		<?php endif; ?>

		<!-- Mobile phone, if available -->
		<?php if(strlen($contact['mobile_phone']) > 0): ?>
		<tr>
			<th>Mobile Phone</th>
			<td><?php echo $contact['mobile_phone']; ?></td>
		</tr>
		<?php endif; ?>

		<!-- Twitter, if available -->
		<?php if(strlen($contact['twitter']) > 0): ?>
		<tr>
			<th>Twitter</th>
			<td><a href="http://twitter.com/<?php echo $contact['twitter']; ?>">@<?php echo $contact['twitter']; ?></a></td>
		</tr>
		<?php endif; ?>

		<!-- Facebook, if available -->
		<?php if(strlen($contact['facebook']) > 0): ?>
		<tr>
			<th>Facebook</th>
			<td><a href="http://facebook.com/<?php echo $contact['facebook']; ?>"><?php echo $contact['facebook']; ?></a></td>
		</tr>
		<?php endif; ?>

		<!-- LinkedIn, if available -->
		<?php if(strlen($contact['linkedin']) > 0): ?>
		<tr>
			<th>LinkedIn</th>
			<td><a href="http://linkedin.com/in/<?php echo $contact['linkedin']; ?>"><?php echo $contact['linkedin']; ?></a></td>
		</tr>
		<?php endif; ?>
	</tbody>
</table>