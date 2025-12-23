const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');

// Multer config: store under uploads/schedules/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/schedules/');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper: run extract_and_upload.py on *this* image
function runExtractScript(userId, imagePath) {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(
      __dirname,
      '..',
      'Input Schedule',
      'extract_and_upload.py'
    );
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    console.log(`Running Python script at: ${scriptPath} with ${pythonCmd}`);
    console.log(`Passing --user ${userId} --image ${imagePath}`);

    const proc = spawn(pythonCmd, [
      scriptPath,
      '--user', userId,
      '--image', imagePath
    ], {
      cwd: path.dirname(scriptPath),
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
      console.log(`extract_and_upload stdout: ${d.toString().trim()}`);
    });
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
      console.error(`extract_and_upload stderr: ${d.toString().trim()}`);
    });
    proc.on('error', (err) => {
      console.error('Failed to start extract_and_upload.py:', err);
      resolve({ success: false, error: err.message });
    });
    proc.on('close', (code) => {
      if (code === 0) {
        console.log('extract_and_upload.py completed successfully');
        resolve({ success: true, output: stdout.trim() });
      } else {
        console.error(`extract_and_upload.py exited with code ${code}`);
        resolve({ success: false, error: stderr.trim() });
      }
    });
  });
}

// GET /api/schedules/ — list all for this user
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id });
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ message: 'Error fetching schedules', error: err.message });
  }
});

// POST /api/schedules/upload — upload + save + extract
router.post('/upload', auth, upload.single('schedule'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1) Save the schedule record
    const newSchedule = new Schedule({
      userId: req.user.id,
      scheduleNumber: req.body.scheduleNumber || 1,
      scheduleImage: req.file.path
    });
    await newSchedule.save();

    // 2) Tell the extractor exactly which image to process
    const absImagePath = path.resolve(req.file.path);
    await runExtractScript(req.user.id, absImagePath);

    // 3) Re-fetch in case extract_and_upload.py updated it
    const updated = await Schedule.findById(newSchedule._id);

    // 4) Return final result
    res.status(201).json({
      message: 'Schedule uploaded and processed successfully',
      schedule: updated
    });

  } catch (err) {
    console.error('Error in /schedules/upload:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
