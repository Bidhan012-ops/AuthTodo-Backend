const todoModel = require('../model/todo');
const User = require('../model/userModel');
exports.getTodos = async (req, res) => {
  try {
    // req.userId is set by the isAuthenticated middleware
    const todos = await todoModel.find({ user: req.userId });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setTodos = async (req, res) => {
  try {
    const { task, date, time } = req.body;

    if (!task || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const todo = new todoModel({
      task,
      date,
      time,
      user: userId
    });

    await todo.save();

    user.mytasks.push(todo._id);
    await user.save();

    res.status(201).json(todo);
  } catch (err) {
    console.error("Error in setTodos:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTodos = async (req, res) => {
  try {
    const id = req.params.id;
    const { task, date, time } = req.body;

    // Ensure the todo belongs to the logged-in user
    const updatedTodo = await todoModel.findOneAndUpdate(
      { _id: id, user: req.userId },
      { task, date, time },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found or unauthorized" });
    }

    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTodos = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    const todo = await todoModel.findOneAndDelete({ _id: id, user: userId });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found or unauthorized" });
    }

    // Remove from user's mytasks array
    await User.findByIdAndUpdate(userId, {
      $pull: { mytasks: id }
    });

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeTodos = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedTodo = await todoModel.findOneAndUpdate(
      { _id: id, user: req.userId },
      { completed: true },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found or unauthorized" });
    }

    res.status(200).json({ message: "Todo marked as completed", todo: updatedTodo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};