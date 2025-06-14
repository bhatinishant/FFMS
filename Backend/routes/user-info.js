const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

// Get user info by email
router.get('/user-info', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT name, email, role, contact, gender, address, pnr_number, seat_number, expiration_date 
       FROM users WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const moment = require('moment-timezone');
    const u = result.rows[0];
    const user = {
      NAME: u.NAME,
      EMAIL: u.EMAIL,
      CONTACT: u.CONTACT,
      GENDER: u.GENDER,
      ADDRESS: u.ADDRESS,
      PNR: u.PNR_NUMBER,
      SEAT: u.SEAT_NUMBER,
      EXPIRY:  moment(u.EXPIRATION_DATE).tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm:ss'),
      ROLE: u.ROLE
    };
    console.log('user '+JSON.stringify(user));
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Update user info
router.post('/user-info', async (req, res) => {
  const { email, name, contact, gender, address, pnr, seat, expiry } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const userResult = await connection.execute(
      `SELECT pnr_number, seat_number FROM users WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  console.log('userResult '+ JSON.stringify(userResult));
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    const currentUser = userResult.rows[0];
    const currentPNR = currentUser.PNR_NUMBER;
    const currentSeat = currentUser.SEAT_NUMBER;

    let expiration_date = null;
    console.log('currentUser '+ JSON.stringify(currentUser));
    if (pnr !== currentPNR || seat !== currentSeat) {
      // Check if new PNR/seat is associated with someone else
      const pnrConflict = await connection.execute(
        `SELECT email FROM pnr_table 
         WHERE pnr_number = :pnr AND seat_number = :seat AND email IS NOT NULL AND email != :email`,
        { pnr, seat, email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('pnrConflict '+ JSON.stringify(pnrConflict));
      if (pnrConflict.rows.length > 0) {
        console.log('400 ');
        return res.status(400).json({ error: 'This PNR and seat are already assigned to another user.' });

      }

      // Validate PNR exists
      const pnrResult = await connection.execute(
        `SELECT expiration_date FROM pnr_table 
         WHERE pnr_number = :pnr AND seat_number = :seat`,
        { pnr, seat },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      console.log('pnrResult '+ JSON.stringify(pnrResult));
      if (pnrResult.rows.length === 0) {
        console.log('400 1');
        return res.status(400).json({ error: 'Invalid PNR and Seat combination.' });
      }

      expiration_date = pnrResult.rows[0].EXPIRATION_DATE;
      console.log('expiration '+expiration)
      // Update PNR table with current user's email
      await connection.execute(
        `UPDATE pnr_table SET email = :email 
         WHERE pnr_number = :pnr AND seat_number = :seat`,
        { email, pnr, seat },
        { autoCommit: false }
      );
    }

    // Update users table
    const updateQuery = `
      UPDATE users
      SET name = :name,
          contact = :contact,
          gender = :gender,
          address = :address,
          pnr_number = :pnr,
          seat_number = :seat
          ${expiration_date ? ', expiration_date = :expiration_date' : ''}
      WHERE email = :email
    `;

    const bindParams = {
      name,
      contact,
      gender,
      address,
      pnr,
      seat,
      email
    };

    if (expiration_date) bindParams.expiration_date = expiration_date;

    await connection.execute(updateQuery, bindParams, { autoCommit: false });
    await connection.commit();

    res.json({ message: 'User info updated successfully' });

  } catch (err) {
    console.error('Error updating user info:', err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Database update failed' });
  } finally {
    if (connection) await connection.close();
  }
});

// Validate PNR
router.get('/validate-pnr', async (req, res) => {
  const { pnr, seat, expiry } = req.query;

  if (!pnr || !seat || !expiry) {
    return res.status(400).json({ valid: false, message: 'Missing required parameters' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT expiration_date FROM pnr_table WHERE pnr_number = :pnr AND seat_number = :seat`,
      { pnr, seat },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false });
    }

    const dbExpiry = new Date(result.rows[0].EXPIRATION_DATE);
    const providedExpiry = new Date(expiry);

    res.json({ valid: dbExpiry.getTime() === providedExpiry.getTime() });
  } catch (err) {
    console.error('Error validating PNR:', err);
    res.status(500).json({ valid: false });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
