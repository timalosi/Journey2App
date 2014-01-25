/*var doClick = function(e) {
	alert("row:" + JSON.stringify(e));
	var item_id = e.row.item_id;
	//var item_id = e.itemId; /* ListView 
	var pd = Alloy.Collections.pending_document;
	var doc = pd.get(item_id).toJSON();
	//var o = doc.toJSON();
	//alert("list click:" + JSON.stringify(e) + "\n\n"+JSON.stringify(doc));

	$.trigger("file_click", {
		path: doc.path,
		filename: doc.filename
	});
};

function doMenu(e) {
	alert("doMenu");
	$.dialog.show();
}

// assign a ListItem template based on the contents of the model
function doTransform(model) {
	var o = model.toJSON();
	if(o.icon !== undefined) {
		o.template = "fileIcon";
		o.icon = o.icon;
	} else {
		o.template = 'title';
	}
	o.item_id = model.id;
	//alert(JSON.stringify(o));
	return o;
}

// Trigger the synchronization
var library = Alloy.Collections.document;
library.fetch();
//alert("pending_documents.length:"+library.length);

// Free model-view data binding resources when this view-controller closes
$.document_list.addEventListener('close', function() {
	$.destroy();
});*/