//Initialize Quill editor

var quill = new Quill('#editor', {
    theme: 'snow'
});
function populateQuillEditor() {
    const descriptionInput = document.getElementById('descriptionInput');
    quill.root.innerHTML = descriptionInput.value;
}

// Call the function to populate the editor
populateQuillEditor();

// Function to update the hidden input field with Quill content
function updateHiddenInput() {
    const descriptionInput = document.getElementById('descriptionInput');
    descriptionInput.value = quill.root.innerHTML;
}

// Attach the update function to the form submit event
document.getElementById('notesForm').addEventListener('submit', function (event) {
    updateHiddenInput();
});
