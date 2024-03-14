const Client = require('pg').Client // require the library.Client
const readline = require('readline');

// create a new client
const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "assignment3"
})



// Function to get all students
async function getAllStudents() {
    try {
        const result = await client.query("SELECT * FROM Students");
        return result.rows;
    } catch (error) {
        console.error("Error getting all students: ", error);
        throw error;
    }
}

// Function to add a new student
async function addStudent(first_name, last_name, email, enrollment_date) {
    try {
        const result = await client.query(
            "INSERT INTO Students (first_name, last_name, email, enrollment_date) VALUES ($1, $2, $3, $4) RETURNING *", [first_name, last_name, email, enrollment_date]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error adding student: ", error);
        throw error;
    }
}

// Function to update student email
async function updateStudentEmail(student_id, new_email) {
    try {
        const result = await client.query(
            "UPDATE students SET email = $1 WHERE student_id = $2 RETURNING *", [new_email, student_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating student email: ", error);
        throw error;
    }
}

// Function to delete a student
async function deleteStudent(student_id) {
    try {
        const result = await client.query(
            "DELETE FROM Students WHERE student_id = $1 RETURNING *", [student_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting student: , error");
        throw error;
    }
}


// Function to handle user input
function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`Select a function to execute:
    1. getAllStudents
    2. addStudent
    3. updateStudentEmail
    4. deleteStudent
    Enter the function number (or type 'exit' to quit): `, async (selection) => {
        switch (selection.trim()) {
            case '1':
                console.log('All students:');
                const allStudents = await getAllStudents();
                console.table(allStudents);
                rl.close();
                promptUser();
                break;
            case '2':
                rl.question('Enter first name: ', async (first_name) => {
                    rl.question('Enter last name: ', async (last_name) => {
                        rl.question('Enter email: ', async (email) => {
                            rl.question('Enter enrollment date (YYYY-MM-DD): ', async (enrollment_date) => {
                                const newStudent = await addStudent(first_name, last_name, email, enrollment_date);
                                console.log('New student added:', newStudent);
                                rl.close();
                                promptUser();
                            });
                        });
                    });
                });
                break;
            case '3':
                rl.question('Enter student ID: ', async (student_id) => {
                    rl.question('Enter new email: ', async (new_email) => {
                        const updatedStudent = await updateStudentEmail(student_id, new_email);
                        console.log('Student email updated:', updatedStudent);
                        rl.close();
                        promptUser();
                    });
                });
                break;
            case '4':
                rl.question('Enter student ID: ', async (student_id) => {
                    const deletedStudent = await deleteStudent(student_id);
                    console.log('Deleted student:', deletedStudent);
                    rl.close();
                    promptUser();
                });
                break;
            case 'exit':
                console.log('Exiting program...');
                rl.close();
                client.end(); // Close the connection before exiting
                break;
            default:
                console.log('Invalid selection');
                rl.close();
                promptUser();
                break;
        }
    });
}

// connect the database and execute the program
client.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
    promptUser();
});


