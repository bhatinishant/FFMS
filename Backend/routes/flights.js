const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

// GET /api/flights - fetch all flights
router.get('/flights', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT id, airline, flight_number, departure, arrival FROM flights`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({ flights: result.rows });

  } catch (err) {
    console.error('Error fetching flights:', err);
    res.status(500).json({ message: 'Error retrieving flights', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/flights - add a new flight
router.post('/flights', async (req, res) => {
  const { airline, flightNumber, departure, arrival } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO flights (airline, flight_number, departure, arrival)
       VALUES (:airline, :flightNumber, :departure, :arrival)`,
      { airline, flightNumber, departure, arrival },
      { autoCommit: true }
    );

    res.status(201).json({ message: 'Flight added successfully' });

  } catch (err) {
    console.error('Error adding flight:', err);
    res.status(500).json({ message: 'Error adding flight', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/flights/:flightNumber - update flight details
router.put('/flights/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  const { AIRLINE, DEPARTURE, ARRIVAL, FLIGHT_NUMBER } = req.body;
  console.log('body'+JSON.stringify(req.body));

  if (!AIRLINE || !DEPARTURE || !ARRIVAL) {
    console.log('res'+AIRLINE+" "+DEPARTURE+" "+ARRIVAL+" "+flightNumber);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE flights
       SET airline = :AIRLINE,
           departure = :DEPARTURE,
           arrival = :ARRIVAL,
           flight_number = :FLIGHT_NUMBER
       WHERE flight_number = :flightNumber`,
      { AIRLINE, DEPARTURE, ARRIVAL, flightNumber, FLIGHT_NUMBER },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ message: 'Flight updated successfully' });

  } catch (err) {
    console.error('Error updating flight:', err);
    res.status(500).json({ message: 'Failed to update flight', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// DELETE /api/flights/:flightNumber - delete a flight
router.delete('/flights/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Delete associated menu items first if any (to handle FK constraint)
    await connection.execute(
      `DELETE FROM menu WHERE flight_number = :flightNumber`,
      [flightNumber]
    );

    // Then delete the flight
    const result = await connection.execute(
      `DELETE FROM flights WHERE flight_number = :flightNumber`,
      [flightNumber],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ message: 'Flight deleted successfully' });

  } catch (err) {
    console.error('Error deleting flight:', err);
    res.status(500).json({ message: 'Failed to delete flight', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET /api/menu/:flightNumber - fetch menu for a specific flight
router.get('/menu/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT food_item, price FROM menu WHERE flight_number = :flightNumber`,
      [flightNumber],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No menu available for this flight' });
    }

    res.json({ menu: result.rows });

  } catch (err) {
    console.error('Error fetching menu for flight:', err);
    res.status(500).json({ message: 'Error retrieving menu', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ✅ POST /api/menu - add menu item (admin only)
router.post('/menu', async (req, res) => {
  const { flightNumber, foodItem, price } = req.body;
  let connection;

  if (!flightNumber || !foodItem || price === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO menu (flight_number, food_item, price)
       VALUES (:flightNumber, :foodItem, :price)`,
      { flightNumber, foodItem, price },
      { autoCommit: true }
    );

    res.status(201).json({ message: 'Menu item added successfully' });

  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ message: 'Error adding menu item', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/order-history
router.post('/order-history', async (req, res) => {
    const { orderId, userEmail, flightNumber, cart, paymentMethod } = req.body;

    if (!cart || cart.length === 0 || !userEmail || !flightNumber || !paymentMethod) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const insertQuery = `
            INSERT INTO order_history (
                ORDER_ID, USER_EMAIL, FLIGHT_NUMBER, FOOD_ITEM, QUANTITY,
                PRICE, TOTAL_PRICE, PAYMENT_METHOD, ORDER_DATE
            ) VALUES (
                :orderId, :userEmail, :flightNumber, :foodItem, :quantity,
                :price, :totalPrice, :paymentMethod, SYSDATE
            )
        `;

        for (const item of cart) {
            await connection.execute(insertQuery, {
                orderId,
                userEmail,
                flightNumber,
                foodItem: item.name,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.price * item.quantity,
                paymentMethod
            });
        }

        await connection.commit();

        res.json({ message: 'Order saved successfully' });
    } catch (err) {
        console.error('Error saving order history:', err);
        res.status(500).json({ message: 'Failed to save order', error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET /api/order-history/:email
router.get('/order-history/:email', async (req, res) => {
    const { email } = req.params;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT flight_number, food_item, quantity, price, total_price, payment_method, order_date,order_id
             FROM order_history
             WHERE user_email = :email
             ORDER BY order_date DESC`,
            [email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ history: result.rows });
    } catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ message: 'Error retrieving history', error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


module.exports = router;
