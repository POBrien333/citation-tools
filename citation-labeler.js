// Get the currently selected items in the Zotero Pane
var selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

// Track how many items were processed and how many were overwritten
var processedCount = 0;
var overwrittenCount = 0;
var itemsWithCitationLabel = [];

// First, gather the items that already have a citation label
for (let item of selectedItems) {
    if (item.isRegularItem()) {
        let extraField = item.getField('extra') || "";
        if (extraField.includes("citation-label:")) {
            itemsWithCitationLabel.push(item);
        }
    }
}

// Ask user if they want to overwrite citation-labels for items that already have one
if (itemsWithCitationLabel.length > 0) {
    var overwrite = window.confirm("There are " + itemsWithCitationLabel.length + " items that already have a citation label. Do you want to overwrite them?");
    if (!overwrite) {
        // If user chooses not to overwrite, just process items without citation-labels
        itemsWithCitationLabel = [];
    }
}

// Process the selected items
for (let item of selectedItems) {
    if (item.isRegularItem()) {
        // Get the creators of the item
        let creators = item.getCreators();
        // Get the year of the item
        let year = item.getField('date');

        if (creators.length > 0 && creators[0].lastName) {
            // Extract the first author's last name
            let lastName = creators[0].lastName.toUpperCase();
            // Extract the first three letters of the last name
            let citationName = lastName.substring(0, 3);

            // Extract the last two digits of the year
            let yearDigits = year ? year.slice(-2) : "??";

            // Generate the citation label
            let citationLabel = citationName + yearDigits;

            // Construct the citation-label entry
            let citationLabelEntry = "citation-label: " + citationLabel;

            // Get the existing value of the Extra field
            let extraField = item.getField('extra') || "";

            // Check if a citation-label already exists in the Extra field
            if (!extraField.includes("citation-label:")) {
                // Append the citation-label to the Extra field
                extraField = citationLabelEntry + "\n" + extraField;
                item.setField('extra', extraField.trim());
                // Save changes to the database immediately
                await item.saveTx();
                processedCount++;
            } else if (itemsWithCitationLabel.includes(item)) {
                // If the item was selected for overwrite
                extraField = citationLabelEntry + "\n" + extraField.replace(/citation-label:.*\n?/g, '');
                item.setField('extra', extraField.trim());
                await item.saveTx();
                overwrittenCount++;
            }
        }
    }
}

// Confirm the operation
window.alert(processedCount + " items were given a citation label." + 
    (overwrittenCount > 0 ? " " + overwrittenCount + " items had their citation label overwritten." : ""));
