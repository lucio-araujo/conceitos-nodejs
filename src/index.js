const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function searchUser(usernameToSearch) {
  return users.find((user) => user.username === usernameToSearch);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = searchUser(username);

  if (!userAlreadyExists) {
    return response.status(400).json(`Username -${username}- not found. :(`);
  }

  request.username = username;

  return next();
}

app.get("/", (request, response) => {
  return response.status(200).json(users);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = searchUser(username);

  if (userAlreadyExists) {
    return response
      .status(400)
      .json(`Username -${username}- already exists! Try another.`);
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = searchUser(username);

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = searchUser(username);

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

// app.get("/todos/:id", checksExistsUserAccount, (request, response) => {

// });

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = searchUser(username);

  const todoToPut = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todoToPut) {
    return response.status(404).json({ error: "todo not found." });
  }

  todoToPut.title = title;
  todoToPut.deadline = deadline;

  return response.status(200).json(todoToPut);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = searchUser(username);

  const todoToPatch = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todoToPatch) {
    return response.status(404).json({ error: "todo not found." });
  }

  todoToPatch.done = true;

  return response.status(200).json(todoToPatch);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = searchUser(username);

  const todoToDelete = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todoToDelete) {
    return response.status(404).json({ error: "todo not found." });
  }

  const index = user.todos.indexOf(todoToDelete);
  user.todos.splice(index, 1);

  return response.status(204);
});

module.exports = app;
