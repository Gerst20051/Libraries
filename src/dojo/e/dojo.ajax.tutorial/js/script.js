//Load Dojo, Dijit and DojoX components
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.dijit");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Tree");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Button");

dojo.addOnLoad(function() {
	var okDialogMsg = dojo.byId("okDialogMessage");

	//This function creates a confirm dialog box which calls a given callback
	//function with a true or false argument when OK or Cancel is pressed.
	function confirmDialog(title, body, callbackFn) {
		var theDialog = new dijit.Dialog({
			id: 'confirmDialog',
			title: title,
			draggable: false,
			onHide: function() {
				theDialog.destroyRecursive();
			}
		});

		var callback = function(mouseEvent) {
			theDialog.hide();
			theDialog.destroyRecursive(false);

			var srcEl = mouseEvent.srcElement ? mouseEvent.srcElement : mouseEvent.target;

			if(srcEl.innerHTML == "OK") callbackFn(true);
			else callbackFn(false);
		};

		var message = dojo.create("p", {
			style: {
				marginTop: "5px"
			},
			innerHTML: body
		});

		var btnsDiv = dojo.create("div", {
			style: {
				textAlign: "center"
			}
		});

		var okBtn = new dijit.form.Button({label: "OK", id: "confirmDialogOKButton", onClick: callback });
		var cancelBtn = new dijit.form.Button({label: "Cancel", id: "confirmDialogCancelButton", onClick: callback });

		theDialog.containerNode.appendChild(message);
		theDialog.containerNode.appendChild(btnsDiv);

		btnsDiv.appendChild(okBtn.domNode);
		btnsDiv.appendChild(cancelBtn.domNode);

		theDialog.show();
	}

	//Clear all selections, disable menu options and clear current contact view
	function refreshGrid() {
		contactsGrid.selection.clear();
		mnuEditContact.set("disabled", true);
		mnuMoveContact.set("disabled", true);
		mnuDeleteContact.set("disabled", true);
		ctxMnuEditContact.set("disabled", true);
		ctxMnuMoveContact.set("disabled", true);
		ctxMnuDeleteContact.set("disabled", true);
		dijit.byId("contactView").set("content", '<em>Select a contact to view above.</em>');
	}

	//Update the data grid to display contacts for the currently selected group
	function updateDataGrid(item) {
		var newURL = "data/contacts.php?group_id="+item.id;
		var newStore = new dojo.data.ItemFileReadStore({url: newURL});
		contactsGrid.setStore(newStore);
		refreshGrid();
	}
	
	//Refresh the data store for the groups dropdown (in case groups added, edited or deleted)
	function refreshGroupDropDown() {
		var theStore = dijit.byId("edit_contact_group").store;
		theStore.close();
		theStore.url = "data/groups.php";
		theStore.fetch();
	}
	
	//Configures the "Rename Group" dialog for the selected group
	function renameGroup() {
		var group = groupsTree.get("selectedItem");
		var groupId = group.id;
		var groupName = group.name;

		dojo.byId("edit_group_id").value = groupId;
		dijit.byId("edit_group_old").set("value", groupName);
		editGroupDialog.show();
	}
	
	//Clears the "Edit Contact" form, sets it up for adding a new contact
	function newContact() {
		var contact = contactsGrid.selection.getSelected()[0];
		refreshGroupDropDown();
		dojo.byId("edit_contact_real_id").value = "";
		dojo.byId("edit_contact_id").value = "[NEW]";
		dijit.byId("edit_contact_group").reset();
		dijit.byId("edit_contact_first_name").reset();
		dijit.byId("edit_contact_last_name").reset();
		dijit.byId("edit_contact_email_address").reset();
		dijit.byId("edit_contact_home_phone").reset();
		dijit.byId("edit_contact_work_phone").reset();
		dijit.byId("edit_contact_twitter").reset();
		dijit.byId("edit_contact_facebook").reset();
		dijit.byId("edit_contact_linkedin").reset();
		
		dijit.byId("editContactDialog").set("title", "New Contact");
		dijit.byId("editContactDialog").show();
	}
	
	//Populates "Edit Contact" form with selected contact's details
	function editContact() {
		refreshGroupDropDown();
		var contact = contactsGrid.selection.getSelected()[0];
		dojo.byId("edit_contact_real_id").value = contact.id;
		dojo.byId("edit_contact_id").value = contact.id;
		dijit.byId("edit_contact_group").set("value", contact.group_id);
		dojo.byId("edit_contact_first_name").value = contact.first_name;
		dojo.byId("edit_contact_last_name").value = contact.last_name;
		dojo.byId("edit_contact_email_address").value = contact.email_address;
		dojo.byId("edit_contact_home_phone").value = contact.home_phone;
		dojo.byId("edit_contact_work_phone").value = contact.work_phone;
		dojo.byId("edit_contact_twitter").value = contact.twitter;
		dojo.byId("edit_contact_facebook").value = contact.facebook;
		dojo.byId("edit_contact_linkedin").value = contact.linkedin;
		
		dijit.byId("editContactDialog").set("title", "Edit Contact");
		dijit.byId("editContactDialog").show();
	}
	
	//Opens and configures the "Move Contact" dialog
	function moveContact() {
		var contact = contactsGrid.selection.getSelected()[0];
		var contactName = contact.first_name+" "+contact.last_name;
		var groupName = contact.name;
		
		dojo.byId("move_contact_id").value = contact.id;
		dojo.byId("move_contact_name").value = contactName;
		dojo.byId("move_contact_old").value = groupName;
		
		dijit.byId("moveContactDialog").show();
	}

	//When a user selects a node in tree, enable/disable menus
	function selectNode(e) {
		var item = dijit.getEnclosingWidget(e.target).item;
		if(item !== undefined) {
			groupsTree.set("selectedItem",item);
			if(item.id != 0) {
				mnuRenameGroup.set("disabled",false);
				mnuDeleteGroup.set("disabled",false);
				ctxMnuRenameGroup.set("disabled",false);
				ctxMnuDeleteGroup.set("disabled",false);
			} else {
				mnuRenameGroup.set("disabled",true);
				mnuDeleteGroup.set("disabled",true);
				ctxMnuRenameGroup.set("disabled",true);
				ctxMnuDeleteGroup.set("disabled",true);
			}
		}
	}
	
	//When a user selects a row in grid, enable/disable menus
	function selectRow(e) {
		if(e.rowIndex != null) {
			this.selection.clear();
			this.selection.setSelected(e.rowIndex, true);

			mnuEditContact.set("disabled", false);
			mnuMoveContact.set("disabled", false);
			mnuDeleteContact.set("disabled", false);
			ctxMnuEditContact.set("disabled", false);
			ctxMnuMoveContact.set("disabled", false);
			ctxMnuDeleteContact.set("disabled", false);
		}
	}
		
	//Display contact detail in main preview pane			
	function displayContact(idx) {
		var item = this.getItem(idx);
		var contactId = item.id;
		contactView.set("href", "data/contact.php?contact_id="+contactId);

		mnuEditContact.set("disabled", false);
		mnuMoveContact.set("disabled", false);
		mnuDeleteContact.set("disabled", false);
		ctxMnuEditContact.set("disabled", false);
		ctxMnuMoveContact.set("disabled", false);
		ctxMnuDeleteContact.set("disabled", false);
	}
	
	//Process the adding of a new group to the database
	function doNewGroup(e) {
		e.preventDefault();
		e.stopPropagation();
		dojo.byId("new_group_ajax").value = "1";
		if(this.isValid()) {
			dojo.xhrPost({
				form: this.domNode,
				handleAs: "json",
				load: function(data) {
					if(data.success) {
						okDialog.set("title","Group created successfully");
						okDialogMsg.innerHTML = "The group <strong>"+data.name+"</strong> was created successfully.";

						groupsStore.newItem({"id":data.id.toString(),"name":data.name}, {"parent": groupsModel.root, "attribute":"groups"});
						groupsStore.save();

						newGroupDialog.hide();
						okDialog.show();
					}
					else {
						okDialog.set("title","Error creating group");
						okDialogMsg.innerHTML = data.error;
						okDialog.show();
					}
				},
				error: function(error) {
					okDialog.set("title","Error creating group");
					okDialogMsg.innerHTML = error;
					okDialog.show();
				}
			});
		}
	}
	
	//Process the editing of an existing group in the database
	function doEditGroup(e) {
		e.preventDefault();
		e.stopPropagation();
		dojo.byId("edit_group_ajax").value = "1";
		if(this.isValid()) {
			dojo.xhrPost({
				form: this.domNode,
				handleAs: "json",
				load: function(data) {
					if(data.success) {
						okDialog.set("title","Group renamed successfully");
						okDialogMsg.innerHTML = "The group <strong>"+data.name+"</strong> was renamed successfully.";

						var group = groupsTree.get("selectedItem");
						groupsStore.setValue(group, "name", data.name);
						groupsStore.save();

						editGroupDialog.hide();
						okDialog.show();
					}
					else {
						okDialog.set("title","Error renaming group");
						okDialogMsg.innerHTML = data.error;
						okDialog.show();
					}
				},
				error: function(error) {
					okDialog.set("title","Error renaming group");
					okDialogMsg.innerHTML = error;
					okDialog.show();
				}
			});
		}
	}
	
	//Process the editing of an existing group in the database
	function deleteGroup() {
		confirmDialog("Confirm delete", "Are you sure you wish to delete this group? This will also delete any contacts in this group.<br />This action cannot be undone.", function(btn) {
			if(btn) {
				var group = groupsTree.get("selectedItem");
				var groupId = group.id;
				var groupName = group.name;

				dojo.xhrPost({
					url: "data/delete_group.php",
					handleAs: "json",
					content: {
						"group_id": groupId
					},
					load: function(data) {
						if(data.success) {
							groupsStore.fetch({
								query: {"id": groupId.toString()},
								onComplete: function (items, request) {
									if(items) {
										var len=items.length;
										for(var i=0;i<len;i++) {
											var item = items[i];
											groupsStore.deleteItem(item);
										}
									}
								},
								queryOptions: { deep: true}
							});
							groupsStore.save();

							groupsTree.set("selectedItem", groupsModel.root);
							updateDataGrid(groupsModel.root);
							okDialog.set("title","Group deleted successfully");
							okDialogMsg.innerHTML = "The group <strong>"+groupName+"</strong> was deleted successfully.";
							okDialog.show();
						}
						else {
							okDialog.set("title","Error deleting group");
							okDialogMsg.innerHTML = data.error;
							okDialog.show();
						}
					},
					error: function(data) {
						okDialog.set("title","Error deleting group");
						okDialogMsg.innerHTML = data;
						okDialog.show();
					}
				});
			}
		});
	}
	
	//Process the moving of a contact to a different group in the database
	function doMoveContact(e) {
		e.preventDefault();
		e.stopPropagation();
		dojo.byId("move_contact_ajax").value = "1";
		if(this.isValid()) {
			dojo.xhrPost({
				form: this.domNode,
				handleAs: "json",
				load: function(data) {
					if(data.success) {
						okDialog.set("title","Contact moved successfully");
						okDialogMsg.innerHTML = "The contact was moved successfully.";

						var treeSel = groupsTree.get("selectedItem");
						var groupId;
						if(treeSel) {
							groupId = treeSel.id;
						} else {
							groupId = 0;
						}
						var url = contactsStore.url+"?group_id="+groupId;
						var newStore = new dojo.data.ItemFileReadStore({url:url});
						contactsGrid.setStore(newStore);
						refreshGrid();
							
						moveContactDialog.hide();
						okDialog.show();
					}
					else {
						okDialog.set("title","Error moving contact");
						okDialogMsg.innerHTML = data.error;
						okDialog.show();
					}
				},
				error: function(error) {
					okDialog.set("title","Error moving contact");
					okDialogMsg.innerHTML = error;
					okDialog.show();
				}
			});
		}
	}
	
	//Process the editing of an existing contact in the database
	function doEditContact(e) {
		e.preventDefault();
		e.stopPropagation();
		dojo.byId("edit_contact_ajax").value = "1";
		if(this.isValid()) {
			dojo.xhrPost({
				form: this.domNode,
				handleAs: "json",
				load: function(data) {
					if(data.success) {
						if(data.new_contact) {
							okDialog.set("title","Contact added successfully");
							okDialogMsg.innerHTML = "The contact was added successfully.";
						} else {
							okDialog.set("title","Contact edited successfully");
							okDialogMsg.innerHTML = "The contact was edited successfully.";
						}

						var treeSel = groupsTree.get("selectedItem");
						var groupId;
						if(treeSel) {
							groupId = treeSel.id;
						} else {
							groupId = 0;
						}
						var url = contactsStore.url+"?group_id="+groupId;
						var newStore = new dojo.data.ItemFileReadStore({url:url});
						contactsGrid.setStore(newStore);
						refreshGrid();
							
						editContactDialog.hide();
						okDialog.show();
					}
					else {
						if(data.new_contact) {
							okDialog.set("title","Error adding contact");
						} else {
							okDialog.set("title","Error editing contact");
						}
						okDialogMsg.innerHTML = data.error;
						okDialog.show();
					}
				},
				error: function(error) {
					okDialog.set("title","Error editing contact");
					okDialogMsg.innerHTML = error;
					okDialog.show();
				}
			});
		}
	}
	
	//Displays a dialog box asking to confirm deletion of contact. Deletes if OK is pressed.
	function deleteContact() {
		var confirmed = false;
		confirmDialog("Confirm delete", "Are you sure you wish to delete this contact?<br />This action cannot be undone.", function(btn) {
			if(btn) {
				var contact = contactsGrid.selection.getSelected()[0];
				var contactId = contact.id;
				var contactName = contact.first_name+" "+contact.last_name;

				dojo.xhrPost({
					url: "data/delete_contact.php",
					handleAs: "json",
					content: {
						"contact_id": contactId
					},
					load: function(data) {
						if(data.success) {
							var treeSel = groupsTree.get("selectedItem");
							var groupId;
							if(treeSel) {
								groupId = treeSel.id;
							} else {
								groupId = 0;
							}
							var url = contactsStore.url+"?group_id="+groupId;
							var newStore = new dojo.data.ItemFileReadStore({url:url});
							contactsGrid.setStore(newStore);
							refreshGrid();

							okDialog.set("title","Contact deleted successfully");
							okDialogMsg.innerHTML = "The contact <strong>"+contactName+"</strong> was deleted successfully.";
							okDialog.show();
						}
						else {
							okDialog.set("title","Error deleting contact");
							okDialogMsg.innerHTML = data.error;
							okDialog.show();
						}
					},
					error: function(data) {
						okDialog.set("title","Error deleting contact");
						okDialogMsg.innerHTML = data;
						okDialog.show();
					}
				});
			}
		});
	}

	//Reload contacts data grid when a user clicks on a node in the groups tree
	dojo.connect(groupsTree, "onClick", null, updateDataGrid);
	
	//Select tree node on right click
	dojo.connect(groupsTree, "onMouseDown", null, selectNode);
	
	//Select data grid row on right click
	dojo.connect(contactsGrid, "onRowContextMenu", null, selectRow);
	
	//Display contact detail on data grid selection
	dojo.connect(contactsGrid, "onSelected", null, displayContact);
	
	//Menus
	dojo.connect(mnuNewContact, "onClick", null, newContact);
	dojo.connect(mnuNewGroup, "onClick", null, function(e) {
		newGroupDialog.show();
	});
	dojo.connect(mnuRenameGroup, "onClick", null, renameGroup);
	dojo.connect(ctxMnuRenameGroup, "onClick", null, renameGroup);
	dojo.connect(mnuDeleteGroup, "onClick", null, deleteGroup);
	dojo.connect(ctxMnuDeleteGroup, "onClick", null, deleteGroup);

	dojo.connect(mnuEditContact, "onClick", null, editContact);
	dojo.connect(ctxMnuEditContact, "onClick", null, editContact);
	dojo.connect(mnuMoveContact, "onClick", null, moveContact);
	dojo.connect(ctxMnuMoveContact, "onClick", null, moveContact);
	dojo.connect(mnuDeleteContact, "onClick", null, deleteContact);
	dojo.connect(ctxMnuDeleteContact, "onClick", null, deleteContact);
	
	//Dialog boxes
	dojo.connect(newGroupDialog, "onShow", null, function(e) {
		dijit.byId("new_group_name").reset();
	});
	dojo.connect(newGroupForm, "onSubmit", null, doNewGroup);
	dojo.connect(newGroupCancel, "onClick", null, function(e) {
		newGroupDialog.hide();
	});		
	
	dojo.connect(editGroupDialog, "onShow", null, function(e) {
		dijit.byId("edit_group_name").reset();
	});
	dojo.connect(editGroupForm, "onSubmit", null, doEditGroup);
	dojo.connect(editGroupCancel, "onClick", null, function(e) {
		editGroupDialog.hide();
	});	
	
	dojo.connect(moveContactDialog, "onShow", null, function(e) {
		var theStore = dijit.byId("move_contact_new").store;
		theStore.close();
		theStore.url = "data/groups.php";
		theStore.fetch();
		dijit.byId("move_contact_new").reset();
	});
	dojo.connect(moveContactForm, "onSubmit", null, doMoveContact);
	dojo.connect(moveContactCancel, "onClick", null, function(e) {
		moveContactDialog.hide();
	});
	
	dojo.connect(editContactForm, "onSubmit", null, doEditContact);
	dojo.connect(editContactCancel, "onClick", null, function(e) {
		editContactDialog.hide();
	});
	
	dojo.connect(okDialogOK, "onClick", null, function(e) {
		dijit.byId("okDialog").hide();
	});	
});