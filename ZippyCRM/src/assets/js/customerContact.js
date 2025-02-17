function AddNewContact() {
    $.get('/Customer/CreateEditContact', function (data) {
        $('#modalBodycontect').html(data);
        $('#contectModal').modal('show');
    });
}
function EditContact(contactId) {
    $.get('/Customer/CreateEditContact/' + contactId, function (data) {
        $('#modalBodycontect').html(data);
        $('#contectModal').modal('show');
    });
}

function DetailsContact(contactId) {
    $.get('/Customer/ContactDetails/' + contactId, function (data) {
        $('#modalBodycontect').html(data);
        $('#contectModal').modal('show');
    });
}

// Show Delete address form in modal
function DeleteContact(ContactId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this Contact record!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showClass: {
            popup: `
                     animate__animated
                     animate__fadeInUp
                     animate__faster
                 `
        },
        hideClass: {
            popup: `
                     animate__animated
                     animate__fadeOutDown
                     animate__faster
                 `
        }
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Customer/ContactDelete', // URL to your delete action method
                type: 'POST',
                data: { id: ContactId },
                success: function (response) {
                    if (response) {
                        // Refresh the DataTable or update the UI accordingly
                        loadContactList();

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
