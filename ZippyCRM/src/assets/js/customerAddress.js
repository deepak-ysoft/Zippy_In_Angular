function loadAddressList() {
    var customerId = $('#customerId').val();
    $.ajax({
        url: '/Customer/GetAddreses?customerId=' + customerId,  /*+ customerId*/  // Update action and controller name if necessary
        type: 'GET',
        success: function (result) {
            $('#profile-Addresses').html(result); // Inject the partial view into the container
        },
        error: function () {
            alert("An error occurred while loading the address list.");
        }
    });
}


// Show Details address form in modal
$(document).on('click', '#addressDetails', function () {
    var id = $(this).data('id');
    $.get('/Customer/AddressDetails/' + id, function (data) {
        $('#modalBody').html(data);
        $('#addressModal').modal('show');
    });
});

// Show Create address form in modal
$(document).on('click', '#createNewAddress', function () {
    $.get('/Customer/CreateEditAddress', function (data) {
        $('#modalBody').html(data);
        $('#addressModal').modal('show');
    });
});

// Show edit address form in modal
$(document).on('click', '#editAddress', function () {
    var id = $(this).data('id');
    $.get('/Customer/CreateEditAddress/' + id, function (data) {
        $('#modalBody').html(data);
        $('#addressModal').modal('show');
    });
});
// Handle form submission with AJAX
$('#modalBody').on('submit', 'form', function (e) {
    e.preventDefault();
    var form = $(this);
    var customerId = $('#customerId').val();
    $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize() + '&CustomerId=' + customerId,
        success: function (response) {
            if (response.success) {
                $('#addressModal').modal('hide');
                loadAddressList(); // Call your function to refresh the address list
            } else {
                $('#modalBody').html(response); // Show validation errors in the modal
            }
        }
    });
});

// Show Delete address form in modal
function DeleteAddress(addressId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this Address record!',
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
                url: '/Customer/DeleteAddress', // URL to your delete action method
                type: 'POST',
                data: { id: addressId },
                success: function (response) {
                    if (response) {
                        // Refresh the DataTable or update the UI accordingly
                        loadAddressList();

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
