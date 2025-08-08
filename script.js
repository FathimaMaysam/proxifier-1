// This script will be included in all HTML pages.
// It uses `if (element)` checks to run page-specific code.

document.addEventListener('DOMContentLoaded', () => {

    // --- Logic for Create Account Step 1 (create.html) ---
    const createFormStep1 = document.getElementById('createFormStep1');
    if (createFormStep1) {
        createFormStep1.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Temporarily save email and password in the browser's session storage
            sessionStorage.setItem('signupEmail', email);
            sessionStorage.setItem('signupPassword', password);
            
            // Redirect to the next step
            window.location.href = 'upload.html';
        });
    }

    // --- Logic for Create Account Step 2 (upload.html) ---
    const createFormStep2 = document.getElementById('createFormStep2');
    if (createFormStep2) {
        createFormStep2.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusDiv = document.getElementById('upload-status');
            statusDiv.innerText = 'Processing... Please wait.';

            // Retrieve saved email and password from session storage
            const email = sessionStorage.getItem('signupEmail');
            const password = sessionStorage.getItem('signupPassword');
            
            // Get details from the current form
            const fullName = document.getElementById('fullName').value;
            const rollNo = document.getElementById('rollNo').value;
            const audioFile = document.getElementById('audioFile').files[0];

            if (!email || !password) {
                alert("Login details not found. Please start the signup process again.");
                window.location.href = 'create.html';
                return;
            }
            if (!audioFile) {
                alert("Please select an audio file.");
                statusDiv.innerText = '';
                return;
            }

            // 1. Create the user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
            if (authError) {
                alert('Error creating account: ' + authError.message);
                statusDiv.innerText = 'Error. Please try again.';
                return;
            }
            
            const user = authData.user;
            const fileName = `${user.id}/${rollNo}_${audioFile.name}`;
            statusDiv.innerText = 'Uploading audio...';

            // 2. Upload the audio file to Supabase Storage
            const { error: uploadError } = await supabase.storage.from('audio-files').upload(fileName, audioFile);
            if (uploadError) {
                alert('Audio upload failed: ' + uploadError.message);
                statusDiv.innerText = 'Error. Please try again.';
                // Optional: Clean up the created user if upload fails
                // await supabase.auth.admin.deleteUser(user.id); 
                return;
            }
            
            statusDiv.innerText = 'Saving details...';
            const { data: urlData } = supabase.storage.from('audio-files').getPublicUrl(fileName);

            // 3. Insert all user info into your 'audio_uploads' table
            const { error: dbError } = await supabase.from('audio_uploads').insert({
                user_id: user.id,
                full_name: fullName,
                roll_no: rollNo,
                file_name: audioFile.name,
                public_url: urlData.publicUrl,
            });

            if (dbError) {
                alert('Database error: ' + dbError.message);
                statusDiv.innerText = 'Error. Please try again.';
            } else {
                // Clean up temporary storage and redirect
                sessionStorage.removeItem('signupEmail');
                sessionStorage.removeItem('signupPassword');
                alert('Account created successfully! Please check your email for a confirmation link, then log in.');
                window.location.href = 'login.html';
            }
        });
    }

    // --- Logic for Login Page (login.html) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert('Error logging in: ' + error.message);
            } else {
                // Redirect to the dashboard on successful login
                window.location.href = 'dashboard.html';
            }
        });
    }

    // --- Logic for Attendance Dashboard Page (dashboard.html) ---
    const attendanceTable = document.getElementById('attendanceTable');
    if (attendanceTable) {
        const attendanceTableBody = attendanceTable.querySelector('tbody');
        const logoutButton = document.getElementById('logout-button');

        logoutButton.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });

        async function loadAttendanceDashboard() {
            const { data: files, error } = await supabase
                .from('audio_uploads')
                .select('roll_no, full_name, public_url')
                .order('roll_no', { ascending: true });

            if (error) {
                console.error('Error loading data:', error);
                attendanceTableBody.innerHTML = `<tr><td colspan="3">Error: Could not load data.</td></tr>`;
                return;
            }
            if (files.length === 0) {
                attendanceTableBody.innerHTML = `<tr><td colspan="3">No students have signed up yet.</td></tr>`;
                return;
            }
            
            attendanceTableBody.innerHTML = ''; // Clear the "loading" message
            
            files.forEach(file => {
                const row = document.createElement('tr');
                
                // Roll No and Full Name cells
                row.innerHTML = `<td>${file.roll_no || 'N/A'}</td><td>${file.full_name || 'N/A'}</td>`;
                
                // Play Button cell
                const playCell = document.createElement('td');
                const playButton = document.createElement('button');
                playButton.innerText = '▶️ Play';
                playButton.className = 'btn';
                playButton.style.marginTop = '0'; // Override default margin for table use
                
                playButton.addEventListener('click', () => {
                    const audio = new Audio(file.public_url);
                    audio.play().catch(e => console.error("Error playing audio:", e));
                });
                
                playCell.appendChild(playButton);
                row.appendChild(playCell);
                
                attendanceTableBody.appendChild(row);
            });
        }
        
        // Initial load of the dashboard data
        loadAttendanceDashboard();
    }
});