// This script will move any Zotero tag to the extra field as a "keyword" so it can be used with CSL citation styles.

function moveTagsToExtra() {
    // Get all selected items in Zotero
    var items = ZoteroPane.getSelectedItems();

    if (!items.length) {
        alert("No items selected.");
        return;
    }

    var updatedItems = 0;

    for (let item of items) {
        // Get current tags
        var tags = item.getTags().map(tag => tag.tag);
        if (!tags.length) continue;

        // Prepare keyword entry
        var keywordEntry = `keyword: ${tags.join(", ")}`;

        // Get the current content of the "Extra" field
        var extra = item.getField("extra") || "";

        // Remove any existing "keyword:" line from the "Extra" field
        extra = extra
            .split("\n")
            .filter(line => !line.startsWith("keyword:"))
            .join("\n");

        // Append the new keyword entry
        if (extra) {
            extra += `\n${keywordEntry}`;
        } else {
            extra = keywordEntry;
        }

        // Set the updated "Extra" field
        item.setField("extra", extra);

        // Save the item
        item.saveTx();
        updatedItems++;
    }

    alert(`${updatedItems} items were updated with their tags in the "Extra" field.`);
}

moveTagsToExtra();
