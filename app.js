const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
app.use(cors());
// Middleware
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// Routes
const userRouter = require('./routes/useRouter');
const todoRouter = require('./routes/todoRoutes');
app.use('/api/users', userRouter);
app.use('/api', todoRouter);
// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;



