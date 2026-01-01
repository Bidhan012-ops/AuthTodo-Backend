const todoRouter = require('express').Router();
const todoController = require('../controller/todocontroller');
const isAuthenticated = require('../middleware/isAuthenticated');

todoRouter.get('/todos', isAuthenticated, todoController.getTodos);
todoRouter.post('/todos', isAuthenticated, todoController.setTodos);
todoRouter.put('/todos/:id', isAuthenticated, todoController.updateTodos);
todoRouter.delete('/todos/:id', isAuthenticated, todoController.deleteTodos);
todoRouter.patch('/todos/:id', isAuthenticated, todoController.completeTodos);

module.exports = todoRouter;