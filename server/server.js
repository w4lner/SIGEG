const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to data file
const dataFilePath = path.join(__dirname, '../data/initialData.json');

// Helper function to read data
const readData = () => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading data:', error);
    return { poe: [], poisson: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// Routes
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/tasks/:user', (req, res) => {
  try {
    const user = req.params.user; // 'poe' or 'poisson'
    const newTask = req.body;
    
    const data = readData();
    
    // Generate new ID
    const maxId = data[user].length > 0 
      ? Math.max(...data[user].map(t => t.id)) 
      : 0;
    
    const taskWithId = {
      ...newTask,
      id: maxId + 1
    };
    
    data[user].push(taskWithId);
    
    if (writeData(data)) {
      res.status(201).json(taskWithId);
    } else {
      res.status(500).json({ error: 'Failed to save task' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:user/:id', (req, res) => {
  try {
    const user = req.params.user;
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    
    const data = readData();
    
    const taskIndex = data[user].findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Keep the original ID
    data[user][taskIndex] = { ...updatedTask, id: taskId };
    
    if (writeData(data)) {
      res.json(data[user][taskIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update task' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:user/:id', (req, res) => {
  try {
    const user = req.params.user;
    const taskId = parseInt(req.params.id);
    
    const data = readData();
    
    const taskIndex = data[user].findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = data[user].splice(taskIndex, 1)[0];
    
    if (writeData(data)) {
      res.json(deletedTask);
    } else {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:user/:id/status', (req, res) => {
  try {
    const user = req.params.user;
    const taskId = parseInt(req.params.id);
    const { entregada } = req.body;
    
    const data = readData();
    
    const task = data[user].find(t => t.id === taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    task.entregada = entregada;
    
    if (writeData(data)) {
      res.json(task);
    } else {
      res.status(500).json({ error: 'Failed to update status' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${dataFilePath}`);
});
