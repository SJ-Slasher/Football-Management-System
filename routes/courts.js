const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all courts
router.get('/', async (req, res) => {
    try {
        const [courts] = await pool.query(
            'SELECT * FROM courts WHERE is_available = TRUE ORDER BY name'
        );
        res.json({ courts });
    } catch (error) {
        console.error('Get courts error:', error);
        res.status(500).json({ error: 'Failed to get courts' });
    }
});

// Get courts with availability status for a specific date
router.get('/availability', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Get all courts
        const [courts] = await pool.query(
            'SELECT * FROM courts WHERE is_available = TRUE ORDER BY name'
        );
        
        // Get all time slots
        const [allSlots] = await pool.query(
            'SELECT * FROM time_slots WHERE is_active = TRUE ORDER BY start_time'
        );
        
        // Get booked slots for each court on the target date
        const courtsWithAvailability = await Promise.all(courts.map(async (court) => {
            const [bookedSlots] = await pool.query(
                `SELECT bts.time_slot_id FROM booking_time_slots bts
                 JOIN bookings b ON bts.booking_id = b.id
                 WHERE b.booking_date = ? AND b.court_id = ? AND b.status != 'cancelled'`,
                [targetDate, court.id]
            );
            
            const bookedCount = bookedSlots.length;
            const totalSlots = allSlots.length;
            const availableCount = totalSlots - bookedCount;
            
            return {
                ...court,
                total_slots: totalSlots,
                booked_slots: bookedCount,
                available_slots: availableCount,
                availability_status: availableCount === 0 ? 'fully_booked' : 
                                     availableCount <= 3 ? 'limited' : 'available'
            };
        }));
        
        res.json({ courts: courtsWithAvailability, date: targetDate });
    } catch (error) {
        console.error('Get court availability error:', error);
        res.status(500).json({ error: 'Failed to get court availability' });
    }
});

// Get single court
router.get('/:id', async (req, res) => {
    try {
        const [courts] = await pool.query(
            'SELECT * FROM courts WHERE id = ?',
            [req.params.id]
        );

        if (courts.length === 0) {
            return res.status(404).json({ error: 'Court not found' });
        }

        res.json({ court: courts[0] });
    } catch (error) {
        console.error('Get court error:', error);
        res.status(500).json({ error: 'Failed to get court' });
    }
});

module.exports = router;
