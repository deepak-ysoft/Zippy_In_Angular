function loadNotesList() {
    var customerId = $('#customerId').val();
    $.ajax({
        url: '/Customer/GetNotes?customerId=' + customerId,
        success: function (result) {
            $('#profile-Notes').html(result); // Inject the partial view into the container
        },
        error: function () {
            alert("An error occurred while loading the notes list.");
        }
    });
}


// Show Details notes form in modal
$(document).on('click', '#notesDetails', function () {
    var id = $(this).data('id');
    $.get('/Customer/NotesDetails/' + id, function (data) {
        $('#modalBodyNotes').html(data);
        $('#notesModal').modal('show');
    });
});

// Show Create Notes form in modal
$(document).on('click', '#createNewNotes', function () {
    $.get('/Customer/CreateEditNotes', function (data) {
        $('#modalBodyNotes').html(data);
        $('#notesModal').modal('show');
    });
});

// Show edit Notes form in modal
$(document).on('click', '#editNotes', function () {
    var id = $(this).data('id');
    $.get('/Customer/CreateEditNotes/' + id, function (data) {
        $('#modalBodyNotes').html(data);
        $('#notesModal').modal('show');
    });
});

$('#modalBodyNotes').on('submit', 'form', function (e) {
    e.preventDefault();
    var form = $(this);
    var customerId = $('#customerId').val();
    $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize() + '&CustomerId=' + customerId,
        success: function (response) {
            if (response.success) {
                $('#notesModal').modal('hide');
                loadNotesList(); // Call your function to refresh the address list
            } else {
                $('#modalBodyNotes').html(response); // Show validation errors in the modal
            }
        }
    });
});

function DeleteNotes(notesId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this notes record!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showClass: {
            popup: `animate__animated
                            animate__fadeInUp
                            animate__faster`
        },
        hideClass: {
            popup: `animate__animated
                            animate__fadeOutDown
                            animate__faster`
        }
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Customer/DeleteNotes', // URL to your delete action method
                type: 'POST',
                data: { id: notesId },
                success: function (response) {
                    if (response) {
                        // Refresh the DataTable or update the UI accordingly
                        loadNotesList();

                    } else {
                        Swal.fire(
                            'Error!',
                            'Something went wrong while deleting the record.',
                            'error'
                        );
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire(
                        'Error!',
                        'An error occurred: ' + error,
                        'error'
                    );
                }
            });
        }
    });
}