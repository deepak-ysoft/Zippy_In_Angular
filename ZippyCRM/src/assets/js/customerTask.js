function loadTaskList() {
    var customerId = $('#customerId').val();
    $.ajax({
        url: '/Customer/GetTasks?customerId=' + customerId,
        type: 'GET',
        success: function (result) {
            $('#profile-Task').html(result); // Inject the partial view into the container
        },
        error: function () {
            alert("An error occurred while loading the Task list.");
        }
    });
}

// Show Details task form in modal
$(document).on('click', '#taskDetails', function () {
    var id = $(this).data('id');
    $.get('/Customer/TaskDetails/' + id, function (data) {
        $('#modalBodyTASK').html(data);
        $('#taskModal').modal('show');
    });
});

// Show Create Task form in modal
$(document).on('click', '#createNewTask', function () {
    $.get('/Customer/CreateEditTask', function (data) {
        $('#modalBodyTASK').html(data);
        $('#taskModal').modal('show');
    });
});

// Show edit Task form in modal
$(document).on('click', '#editTask', function () {
    var id = $(this).data('id');

    $.get('/Customer/CreateEditTask/' + id, function (data) {
        $('#modalBodyTASK').html(data);
        $('#taskModal').modal('show');
    });
});

$('#modalBodyTASK').on('submit', 'form', function (e) {
    e.preventDefault();
    var form = $(this);
    var customerId = $('#customerId').val();
    $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize() + '&CustomerId=' + customerId,
        success: function (response) {
            if (response.success) {
                $('#taskModal').modal('hide');
                loadTaskList(); // Call your function to refresh the address list
            } else {
                $('#modalBodyTASK').html(response); // Show validation errors in the modal
            }
        }
    });
});

function DeleteTask(taskId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this task record!',
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
                url: '/Customer/DeleteTask', // URL to your delete action method
                type: 'POST',
                data: { id: taskId },
                success: function (response) {
                    if (response) {
                        // Refresh the DataTable or update the UI accordingly
                        loadTaskList();

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