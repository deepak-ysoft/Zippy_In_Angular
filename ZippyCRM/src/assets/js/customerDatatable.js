$(document).ready(function () {
    $("#customerDatatable").DataTable({
        "processing": true,
        "serverSide": true,
        "filter": true,
        "ajax": {
            "url": "/api/customerapi",
            "type": "POST",
            "datatype": "json"
        },
        "columnDefs": [{
            "targets": [0],
            "visible": false,
            "searchable": false
        }],
        "columns": [
            { "data": "cId", "name": "CId", "autoWidth": true },
            {
                // Render the image
                "data": "imagepath",
                "name": "Imagepath",
                "autoWidth": true,
                "render": function (data, type, row) {
                    return '<img src="/img/' + data + '" alt="Customer Image" class="rounded-circle" style="width:36px;height:36px;"/>';
                }
            },
            {
                "data": "firstName", "name": "FirstName", "autoWidth": true, "render": function (data, type, row) {
                    // Assuming `row.cId` is the unique identifier for each customer
                    return "<a href='/Customer/CustomerProfile/" + row.cId + "'>" + data + "</a>";
                } },
            { "data": "middleName", "name": "MiddleName", "autoWidth": true },
            { "data": "lastName", "name": "LastName", "autoWidth": true },
            { "data": "dayOfBirth", "name": "DateOfBirth", "autoWidth": true },
            { "data": "cell", "name": "Cell", "autoWidth": true },
            { "data": "email", "name": "Email", "autoWidth": true },
            { "data": "website", "name": "Website", "autoWidth": true },
            {
                "render": function (data, type, row) {
                    return "<a href='/Customer/CreateEditCustomer/" + row.cId + "' class=' fas fa-pencil-alt fa-lg'></a>  &nbsp; &nbsp;&nbsp;" +
                           "<a href='/Customer/CustomerDetails/" + row.cId + "' class='fa-solid fa-circle-info fa-xl text-info'></a> &nbsp; &nbsp;&nbsp;" +
                           "<a href='#' class='fas fa-trash fa-lg text-danger' onclick='DeleteCustomer(\"" + row.cId + "\"); return false;'></a>";
                }
            },
        ]
    });
});


function DeleteCustomer(customerId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this customer record!',
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
                url: '/Customer/DeleteCustomer', // URL to your delete action method
                type: 'POST',
                data: { id: customerId },
                success: function (response) {
                    if (response) {
                        // Refresh the DataTable or update the UI accordingly
                        $("#customerDatatable").DataTable().ajax.reload();
                      
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
