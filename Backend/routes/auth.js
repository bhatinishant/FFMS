const express = require('express');
const router = express.Router(); // ✅ Define router FIRST
const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');


// ✅ Signup Route
router.post('/signup', async (req, res) => {
  const {
    name, email, password, role, contact, gender, address,
    employeeId, workEmail, passkey,
    pnrNumber, seatNumber
  } = req.body;

  console.log('Signup data received:', req.body);

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('DB connection successful');

    // ✅ Check if user already exists
    const existing = await connection.execute(
      `SELECT * FROM users WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let pnr_value = null;
    let seat_value = null;

    // ✅ Admin validation
    if (role === 'Admin') {
      const empResult = await connection.execute(
        `SELECT emp_id FROM employees
         WHERE emp_id = :empId AND work_email = :wEmail AND paaskey = :pkey`,
        { empId: employeeId, wEmail: workEmail, pkey: passkey },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (empResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid Employee ID or email or passkey. Registration denied.' });
      }

      // Admins don't need PNR or seat info
    }

    // ✅ Passenger PNR logic
    if (role === 'Passenger') {
      if (!pnrNumber || !seatNumber) {
        return res.status(400).json({ message: 'PNR number and seat number are required for Passenger signup' });
      }

      // 1️⃣ Check if PNR + seat exists and is not expired
      const pnrCheck = await connection.execute(
        `SELECT email , expiration_date FROM pnr_table
         WHERE pnr_number = :pnrNumber
           AND seat_number = :seatNumber
           AND expiration_date > SYSDATE`,
        { pnrNumber, seatNumber },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (pnrCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired PNR number or seat mismatch' });
      }

      const existingEmail = pnrCheck.rows[0].EMAIL;
      const expirationDate = pnrCheck.rows[0].EXPIRATION_DATE;
      if (existingEmail && existingEmail !== email) {
        return res.status(400).json({ message: 'This PNR is already associated with another user' });
      }

      // 2️⃣ Update the pnr_table to associate the email (if not already set)
      if (!existingEmail) {
        await connection.execute(
          `UPDATE pnr_table
           SET email = :email
           WHERE pnr_number = :pnrNumber
             AND seat_number = :seatNumber`,
          { email, pnrNumber, seatNumber }
        );
      }

      pnr_value = pnrNumber;
      seat_value = seatNumber;
      expiration_value = expirationDate;
    }

    // ✅ Insert into users table
    await connection.execute(
      `INSERT INTO users (name, email, password, role, contact, gender, address, pnr_number, seat_number, expiration_date)
       VALUES (:name, :email, :password, :role, :contact, :gender, :address, :pnr, :seat, :expDate)`,
      {
        name, email, password, role, contact, gender, address,
        pnr: pnr_value, seat: seat_value, expDate: expiration_value || null
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT name, role FROM users WHERE email = :email AND password = :password`,
      { email, password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // ✅ Check PNR status from pnr_table
    const pnrResult = await connection.execute(
      `SELECT expiration_date FROM pnr_table WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let redirectPage = 'personal-info.html'; // Default fallback

    if (pnrResult.rows.length > 0) {
      const expiration = pnrResult.rows[0].EXPIRATION_DATE;
      const currentDate = new Date();
      console.log('currentDate '+currentDate + ' expiration '+ expiration)
      if (expiration > currentDate) {
        redirectPage = 'index.html';
      }
    }
    
    res.status(200).json({
      name: user.NAME,
      email,
      role: user.ROLE,
      redirectPage // ✅ Send correct page decision
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
