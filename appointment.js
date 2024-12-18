const userId = "39cc91c9a916461532baaabbec128916"; // Replace with the actual user ID
const endpoint = `http://192.168.56.234/doctor/api/v2/appointment?user_id=${userId}`;
const appointmentsContainer = document.getElementById("appointments-container");

async function fetchAppointments() {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.status === "success") {
            const appointments = data.appointments;

            appointmentsContainer.innerHTML = ""; // Clear any existing content

            appointments.forEach(appointment => {
                const box = document.createElement("div");
                box.classList.add("box");

                box.innerHTML = `
                    <h3>Doctor: ${appointment.name}</h3>
                    <p>
                        Appointment DateTime: ${new Date(appointment.appointment_time).toLocaleDateString()}<br>
                        Email: ${appointment.email}
                    </p>
                `;

                appointmentsContainer.appendChild(box);
            });
        } else {
            appointmentsContainer.innerHTML = `<p>No appointments found.</p>`;
        }
    } catch (error) {
        console.error("Error fetching appointments:", error);
        appointmentsContainer.innerHTML = `<p>Error loading appointments. Please try again later.</p>`;
    }
}

// Fetch and display appointments on page load
fetchAppointments();
