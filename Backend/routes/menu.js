const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

// GET /api/menu/:flightNumber - fetch menu items based on flight number
router.get('/menu/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT id, food_item, price FROM menu WHERE flight_number = :flightNumber`,
      [flightNumber],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No menu found for this flight' });
    }

    res.json({ menu: result.rows });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ message: 'Error retrieving menu', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/menu/:flightNumber - update menu item details
router.put('/menu/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  console.log('kya'+JSON.stringify(req.params));
  const { FOOD_ITEM, PRICE, FLIGHT_NUMBER } = req.body;
  console.log('body'+JSON.stringify(req.body));

  if (!FOOD_ITEM || !PRICE) {
    console.log('res'+FOOD_ITEM+" "+PRICE+" "+flightNumber);
    return res.status(400).json({ message: 'Missing required fields' });
  }

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE menu
       SET food_item = :FOOD_ITEM,
           price = :PRICE
       WHERE food_item = :flightNumber`,
      { FOOD_ITEM, PRICE, flightNumber },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated successfully' });

  } catch (err) {
    console.error('Error updating Item:', err);
    res.status(500).json({ message: 'Failed to update Item', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE /api/menu/:flightNumber - delete a menu item
router.delete('/menu/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    //  delete the menu item
    const result = await connection.execute(
     `DELETE FROM menu WHERE food_item = :flightNumber`,
     [flightNumber],
     { autoCommit: true }
   );

if (result.rowsAffected === 0) {
  return res.status(404).json({ message: 'Menu Item not found' });
}

res.json({ message: 'Item deleted successfully' });

} catch (err) {
console.error('Error deleting menu item:', err);
res.status(500).json({ message: 'Failed to delete menu item', error: err.message });
} finally {
if (connection) await connection.close();
}
});

// POST /api/menu - add a new menu item
router.post('/menu', async (req, res) => {
  const { flightNumber, foodItem, price } = req.body;
  let connection;

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

module.exports = router;
