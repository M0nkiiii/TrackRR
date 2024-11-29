// server/routes/predictionRoutes.js
const express = require('express');
const { exec } = require('child_process'); // To simulate calling the Python model
const router = express.Router();

// Route for predicting screentime
router.get('/predict', (req, res) => {
    

    const modelPath = './final_capstone_model.py'; 

    exec(`python3 ${modelPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing model: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute model' });
        }

        if (stderr) {
            console.error(`Model error: ${stderr}`);
            return res.status(500).json({ error: 'Model execution returned errors' });
        }

        // Send fake response for presentation purposes
        res.status(200).json(Prediction);
    });
});

module.exports = router;
