loadContactList();
function loadContactList() {
    var customerId = $('#customerId').val();
    $.ajax({
        url: '/Customer/ContactList?customerId=' + customerId,
        type: 'GET',
        success: function (result) {
            $('#profile-Contacts').html(result); // Inject the partial view into the container
        },
        error: function () {
            alert("An error occurred while loading the Contact list.");
        }
    });
}


// Form submission with AJAX (for Create and Edit)
$('#modalBodycontect').on('submit', 'form', function (e) {
    e.preventDefault();
    var form = $(this);
    var customerId = $('#customerId').val();
    $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize() + '&CustomerId=' + customerId,
        success: function (response) {
            if (response.success) {
                $('#contectModal').modal('hide');
                loadContactList();
            } else {
                $('#modalBodycontect').html(response);
            }
        }
    });
});
