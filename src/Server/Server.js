require("dotenv").config();
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();
const serverPort = 3001;

const { Client } = require("pg");
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
client.connect();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "12345678", /// can to insert your personal secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);

app.get("/", (req, res) => {
  res.send("Hello! The server is working!");
});

app.listen(serverPort, () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
});

// Код для реєстрації користувача
app.post("/form-data-register", async (req, res) => {
  const { email, pwd } = req.body;
  try {
    await client.query("BEGIN");
    // Перевірка, чи існує користувач з даною електронною поштою
    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(200)
        .json({ message: "Користувач з такою електронною поштою вже існує!" });
    }

    const hashedPassword = await bcrypt.hash(pwd, 10);
    const result = await client.query(
      "INSERT INTO users (email, password, isadmin) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, "false"],
    );
    await client.query("COMMIT");

    const user = result.rows[0];
    req.session.reqUserId = user.userid;
    res.status(201).json({ user: { userID: req.session.reqUserId } });
    console.log(result);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res
      .status(500)
      .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
  }
});

// Код для входу користувача
app.post("/form-data-auth", async (req, res) => {
  const { email, pwd } = req.body;
  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (user) {
      const isValidPassword = await bcrypt.compare(pwd, user.password);
      if (isValidPassword) {
        // Створення сесії
        req.session.reqUserId = user.userid;
        res.status(200).json({ user: { userID: req.session.reqUserId } });
      } else {
        res.status(401).json({ message: "Невірний пароль!" });
      }
    } else {
      res.status(404).json({
        message: "Користувача не знайдено! Перевірте правильність ел. пошти!",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
  }
});

app.get("/form-data-allBooks", (req, res) => {
  client.query("SELECT * FROM Books", (error, results) => {
    if (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
    } else {
      res.status(200).json(results.rows);
    }
  });
});

app.post("/form-data-addSaveBook", async (req, res) => {
  const { userID, bookID } = req.body;
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "INSERT INTO savedbooks (userid, bookid) VALUES ($1, $2) RETURNING *",
      [userID, bookID],
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res
      .status(500)
      .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
  }
});

app.get("/form-data-savedBooks", async (req, res) => {
  const userID = req.query.userID;
  try {
    const result = await client.query(
      "SELECT books.* FROM savedbooks JOIN books ON savedbooks.bookid = books.bookid WHERE savedbooks.userid = $1",
      [userID],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
  }
});

app.delete(
  "/form-data-deleteFromSavedBooks/:userID/:bookID",
  async (req, res) => {
    const { userID, bookID } = req.params;
    try {
      await client.query(
        "DELETE FROM savedbooks WHERE userid = $1 AND bookid = $2",
        [userID, bookID],
      );
      res.status(200).json({ message: "Книжка успішно видалена з обраних!" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Внутрішня помилка сервера! Спробуйте пізніше!" });
    }
  },
);

app.get("/export", async (req, res) => {
  const userID = req.query.userID;
  try {
    // Отримати список книг з бази даних
    const result = await client.query(
      "SELECT books.* FROM savedbooks JOIN books ON savedbooks.bookid = books.bookid WHERE savedbooks.userid = $1",
      [userID],
    );
    const savedBooks = result.rows;

    if (savedBooks.length === 0) {
      return res.status(204).send(); // Відправити статус 204 (No Content), якщо список порожній
    }

    // Перетворити список книг в CSV
    const parser = new Parser();
    const csv = parser.parse(savedBooks);

    // Встановити заголовки відповіді, щоб вказати, що це файл CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=Favorites.csv");

    // Відправити дані CSV як відповідь
    res.send(csv);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("Виникла помилка при вивантаженні списку книжок з обраних");
  }
});
