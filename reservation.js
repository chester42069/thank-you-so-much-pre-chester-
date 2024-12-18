document.addEventListener('DOMContentLoaded', async function () {
    const doctorId = "f577dae2287aedc386c3a1beeb101c55"; // Doctor ID
    const userId = "39cc91c9a916461532baaabbec128916"; // User ID
    const availabilityEndpoint = `http://192.168.56.234/doctor/api/v2/availability?user_id=${doctorId}`;
    const setAppointmentEndpoint = `http://192.168.56.234/doctor/api/v2/set-appointment`;

    let availableRanges = []; // To store availability ranges

    // Fetch availability
    async function fetchAvailability() {
        try {
            const response = await fetch(availabilityEndpoint);
            const data = await response.json();

            if (data.status === "success") {
                availableRanges = data.data.map(event => ({
                    start: new Date(event.start_time),
                    end: new Date(event.end_time)
                }));

                return data.data.map(event => ({
                    id: event.availability_id,
                    title: "Available",
                    start: event.start_time,
                    end: event.end_time,
                    color: "#28a745" // Green for availability
                }));
            } else {
                console.error("Failed to fetch availability:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            return [];
        }
    }

    const events = await fetchAvailability();

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
        },
        events: events,
        selectable: true,
        editable: false,
        selectOverlap: function (event) {
            // Allow selecting only within "Available" blocks
            return event.title === "Available";
        },
        select: function (info) {
            const selectedStart = new Date(info.startStr);
            const selectedEnd = new Date(info.endStr);

            // Ensure the selected time is within available ranges
            const isWithinAvailability = availableRanges.some(range => {
                return selectedStart >= range.start && selectedEnd <= range.end;
            });

            if (!isWithinAvailability) {
                alert('Please select time slots within the available time.');
                calendar.unselect();
                return;
            }

            if (confirm(`Set an appointment on ${info.startStr}?`)) {
                const appointmentTime = formatAppointmentTime(info.startStr); // Format the time
                setAppointment(calendar, info, userId, doctorId, setAppointmentEndpoint, appointmentTime);
            }
            calendar.unselect();
        },
        eventClick: function (info) {
            if (info.event.title === "Available") {
                alert("This is an available slot. Select the time by clicking and dragging.");

                const appointmentTime = formatAppointmentTime(info.event.startStr); // Format the time
                setAppointment(calendar, info, userId, doctorId, setAppointmentEndpoint, appointmentTime);
            } else if (info.event.title === "Appointment") {
                alert("This time slot is already booked.");
            }
        }
    });

    calendar.render();

    // Function to format the time to 'YYYY-MM-DD HH:MM:SS'
    function formatAppointmentTime(dateTime) {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Function to handle setting an appointment
    function setAppointment(calendar, info, userId, doctorId, setAppointmentEndpoint, formattedTime) {
        $.ajax({
            url: `${setAppointmentEndpoint}?user_id=${userId}&doctor_id=${doctorId}&appointment_time=${formattedTime}`,
            type: 'GET',
            success: function (response) {
                console.log(response);
                if (response.status === "success") {
                    alert(response.message);
                    calendar.addEvent({
                        title: "Appointment",
                        start: info.startStr,
                        end: info.endStr,
                        color: "#007bff" // Blue for appointment
                    });
                } else {
                    alert('Error setting appointment: ' + response.message);
                }
            },
            error: function () {
                alert('Error connecting to the server.');
            }
        });
    }
});
