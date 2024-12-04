// This script takes the first author letters and the last 2 digits from the year and outputs it into the extra field as the citation-label to use with CSL citation styles in Zotero.
(async () => {
    var items = Zotero.getActiveZoteroPane().getSelectedItems();
    if (!items.length) {
        window.alert("No items selected.");
        return;
    }

    var existingLabels = 0;
    var skippedItems = 0;
    var updatedItems = 0;


    items.forEach(item => {
        var extraField = item.getField('extra');
        if (extraField && extraField.includes('citation-label')) {
            existingLabels++;
        }
    });

    // Prompt for overwrite if necessary
    var overwrite = true;
    if (existingLabels > 0) {
        overwrite = window.confirm(
            `${existingLabels} items already have a citation-label. Do you want to overwrite them?`
        );
    }

    // Process items
    for (let item of items) {
        var extraField = item.getField('extra');
        if (extraField && extraField.includes('citation-label')) {
            if (!overwrite) continue; // Skip if overwrite not confirmed
        }

        var date = item.getField('date', false, true);
        var yearLastTwoDigits = '';
        if (date) {
            var parsedDate = Zotero.Date.strToDate(date);
            if (parsedDate.year) {
                yearLastTwoDigits = parsedDate.year.toString().slice(-2); // Extract last 2 digits of the year
            }
        }

        if (!yearLastTwoDigits) {
            skippedItems++;
            continue; // Skip items without a valid year
        }

        var authors = item.getCreators();
        if (!authors || authors.length === 0) {
            skippedItems++;
            continue; // Skip items without authors
        }

        var lastName = authors[0].lastName.toUpperCase();
        var citationLabel = `${lastName.slice(0, 3)}${yearLastTwoDigits}`;

        // Prepend to the Extra field
        extraField = (extraField || '').replace(/^/, `citation-label: ${citationLabel}\n`);
        item.setField('extra', extraField);
        updatedItems++;
    }

    // Save changes
    await Zotero.DB.executeTransaction(async () => {
        for (let item of items) {
            await item.saveTx();
        }
    });

    // Summary alert
    window.alert(
        `${updatedItems} items were given a citation label.\n` +
        `${skippedItems} items were skipped.\n` +
        `${existingLabels} existing citation-labels were ${overwrite ? 'overwritten' : 'not overwritten'}.`
    );
})();
