function initializeCalendar() {
     var customerId = $('#customerId').val();
    $('#calendar').fullCalendar({
        weekends: true,
        editable: true,  // Enables drag-and-drop and resizing
        defaultView: 'month',  // Change view to 'month'
        allDaySlot: false,  // Disable all-day slot (optional)
        slotDuration: '06:00:00',  // 6-hour slots (only relevant for agenda views)
        minTime: '00:00:00',  // Start time at midnight
        maxTime: '24:00:00',  // End time at 24 hours (midnight next day)
        slotLabelFormat: 'H:mm',  // 24-hour time format (relevant for time-based views)
        events: function (start, end, timezone, callback) {
            $.ajax({
                url: '/Customer/GetAppointments?customerId=' + customerId,
                type: 'GET',
                success: function (data) {
                    var events = data.map(function (appointment) {
                        return {
                            id: appointment.appointmentid,
                            title: appointment.subject,
                            description: appointment.description,
                            start: appointment.start,
                            end: appointment.end
                        };
                    });
                    callback(events); // Provide the events to the calendar
                },
                error: function () {
                    alert('There was an error while fetching events!');
                }
            });
        },
        eventRender: function (event, element) {
            if (event.description) {
                element.attr('title', event.description); // Tooltip for description
            }

            // Get the day of the week for the event (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            var dayOfWeek = moment(event.start).day();

            // Apply different colors based on the weekday
            switch (dayOfWeek) {
                case 0: // Sunday
                    element.css('background-color', '#FFCCCC'); //  Light red
                    element.css('color', '#000000'); // dark text
                    break;
                case 1: // Monday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#CCE5FF'); // Light blue
                    break;
                case 2: // Tuesday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#D5ECC2'); // Light green
                    break;
                case 3: // Wednesday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#FFF6A1'); // Light yellow
                    break;
                case 4: // Thursday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#FFCCF9'); // Light pink
                    break;
                case 5: // Friday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#CCFFCC'); // Light green
                    break;
                case 6: // Saturday
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#FFEBCC'); // Light orange
                    break;
                default:
                    element.css('color', '#000000'); // dark text
                    element.css('background-color', '#FFFFFF'); // Default white for safety
            }
        },
        // Handle event dragging (update the start and end date when dropped)
        eventDrop: function (event, delta, revertFunc) {
            var newStart = event.start.format(); // New start date
            var newEnd = event.end ? event.end.format() : newStart; // New end date, fallback to start if no end date

            $.ajax({
                url: '/Customer/UpdateAppointment',  // Your ASP.NET Core endpoint
                type: 'POST',
                data: {
                    id: event.id,
                    newStart: newStart,
                    newEnd: newEnd
                },
                success: function () {
                },
                error: function () {
                    revertFunc();  // Revert the change if update fails
                    alert('Failed to update appointment.');
                }
            });
        },
        // Handle event resizing (update the start and end date when resized)
        eventResize: function (event, delta, revertFunc) {
            var newStart = event.start.format();
            var newEnd = event.end ? event.end.format() : newStart;

            $.ajax({
                url: '/Customer/UpdateAppointment',
                type: 'POST',
                data: {
                    id: event.id,
                    newStart: newStart,
                    newEnd: newEnd
                },
                success: function () {
                },
                error: function () {
                    revertFunc();  // Revert the change if update fails
                    alert('Failed to resize appointment.');
                }
            });
        },
         eventClick: function (event) {
            var appointmentId = event.id; // Assuming `id` is the appointment identifier

            // Fetch the appointment details using AJAX
            $.get('/Customer/GetAppointmentDetails', { id: appointmentId }, function (data) {
                // Inject the details into the modal and show the modal
                $('#modalBodyAppointment').html(data);
                $('#appointmentModal').modal('show');
            });
        }
    });
}

// Show edit Appointment form in modal
$(document).on('click', '#editAppointment', function () {
    var id = $(this).data('id');
    $.get('/Customer/CreateEditAppointment/' + id, function (data) {
        $('#modalBodyAppointment').html(data);
        $('#appointmentModal').modal('show');
    });
});


$(document).on('click', '#createNewAppointment', function () {
    $.get('/Customer/CreateEditAppointment', function (data) {
        $('#modalBodyAppointment').html(data);
        $('#appointmentModal').modal('show');
    });
});

$('#modalBodyAppointment').on('submit', 'form', function (e) {
    e.preventDefault();
    var form = $(this);
    var customerId = $('#customerId').val();
    $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize() + '&CustomerId=' + customerId,
        success: function (response) {
            if (response.success) {
                $('#appointmentModal').modal('hide');
                $('#calendar').fullCalendar('refetchEvents'); // Refresh calendar
            } else {
                $('#modalBodyAppointment').html(response); // Show validation errors in the modal
            }
        }
    });
});

function DeleteAppointment(appointmentId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this appointment record!',
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
                url: '/Customer/DeleteAppointment', // URL to your delete action method
                type: 'POST',
                data: { id: appointmentId },
                success: function (response) {
                    if (response) {
                        $('#appointmentModal').modal('hide');
                        // Refresh the DataTable or update the UI accordingly
                        $('#calendar').fullCalendar('refetchEvents');

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