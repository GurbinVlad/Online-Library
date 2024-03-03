import MainMenuImg from "../../Img/MainMenu/BackgroundImgMainMenu(Reverse).jpeg";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import "../../Stylesheet/MainMenu/MainMenu.css";
import "react-toastify/dist/ReactToastify.css";
import { Navbar, Nav } from "react-bootstrap";
import React, { Component } from "react";

const withNavigation = (Component) => (props) => {
  const navigate = useNavigate();
  return <Component {...props} navigate={navigate} />;
};

class MainMenu extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      activeButton: null,
      books: [],
      savedBooks: [],
      isBookSaved: {},
    };

    this.handleClick = this.handleClick.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleDownloadCSV = this.handleDownloadCSV.bind(this);
    this.handleDeleteFavorite = this.handleDeleteFavorite.bind(this);
    this.handleAddToFavorites = this.handleAddToFavorites.bind(this);
    this.handleGetAllFavorites = this.handleGetAllFavorites.bind(this);
  }

  componentDidMount() {
    // Встановлюємо активну кнопку при завантаженні компонента
    const path = window.location.pathname;
    if (path === "/") {
      this.setState({ activeButton: "library" });
      setTimeout(() => {
        const element = document.getElementById("globalLibrary");
        if (element) {
          element.scrollIntoView();
        }
      }, 0); // Затримка переходу на 0 мілісекунд для того щоб відбувся скролінг одночасно з поміткою активної кнопки
    } else toast("Помилка з перенаправленням! Спробуйте пізніше!");

    // Виклик API для отримання списку всіх книг
    fetch("http://localhost:3001/form-data-allBooks")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => this.setState({ books: data }))
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error,
        );
      });

    this.handleGetAllFavorites(this.context.userID);
    console.log(
      `Функція this.handleGetAllFavorites() викликана у componentDidMount(), UserID: ` +
        this.context.userID,
    );
  }

  // Функція для додавання книжок в обрані
  handleAddToFavorites(userID, bookID) {
    fetch("http://localhost:3001/form-data-addSaveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, bookID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // Оновлюємо стан кнопки додавання цієї книжки в обрані
          this.setState((prevState) => ({
            isBookSaved: {
              ...prevState.isBookSaved,
              [bookID]: true,
            },
          }));
        }

        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleGetAllFavorites = (userID) => {
    if (userID !== null) {
      // Виклик API для отримання списку обраних книжок
      fetch(`http://localhost:3001/form-data-savedBooks?userID=${userID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            // Оновлюємо стан savedBooks та isBookSaved на основі отриманих даних
            const isBookSaved = {};
            data.forEach((book) => {
              isBookSaved[book.bookid] = true;
            });
            this.setState({ savedBooks: data, isBookSaved });
          }
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error,
          );
        });
    }
  };

  // Функція для видалення книжок з обраних
  handleDeleteFavorite(userID, bookID) {
    fetch(
      `http://localhost:3001/form-data-deleteFromSavedBooks/${userID}/${bookID}`,
      {
        method: "DELETE",
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          // Оновлюємо стан кнопки додавання цієї книжки в обрані
          this.setState((prevState) => ({
            isBookSaved: {
              ...prevState.isBookSaved,
              [bookID]: false,
            },
          }));
        }

        console.log(data.message);
        // Оновити список обраних книжок після видалення
        this.handleGetAllFavorites(userID);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error,
        );
      });
  }

  handleDownloadCSV(userID) {
    fetch(`http://localhost:3001/export?userID=${userID}`)
      .then((response) => {
        if (response.status === 204) {
          // Вивести повідомлення, якщо список порожній
          toast(
            "Ваш список обраних книжок пустий! Для початку додайте хоча б якусь книжку!",
          );
          throw new Error("No content"); // Зупинити подальше виконання
        } else if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        // Створити новий об'єкт URL для blob
        const url = window.URL.createObjectURL(blob);
        // Створити новий посилання DOM
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        // Встановити ім'я файлу
        a.download = "Favorites.csv";
        // Додати посилання до документа
        document.body.appendChild(a);
        // Натиснути на посилання для завантаження
        a.click();
        // Видалити посилання після завантаження
        document.body.removeChild(a);
        // Вивести повідомлення про успішне завантаження
        toast("Файл «Favorites.csv» завантажено!");
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error,
        );
      });
  }

  handleClick = (buttonName) => {
    this.setState({ activeButton: buttonName });
  };

  render() {
    return (
      <div>
        <Navbar className="navbar" id="navBar">
          <div className="site-title">API Book Library</div>
          <div className="nav-links">
            <Nav.Link
              href="#"
              onClick={() => {
                this.handleClick("library");
                window.scrollTo(0, 0);
              }}
              className={this.state.activeButton === "library" ? "active" : ""}
            >
              Бібліотека
            </Nav.Link>

            <Nav.Link
              href="#myFavorites"
              onClick={() => {
                this.handleClick("favorites");
                window.scrollTo(0, 0);

                if (this.context.userID) {
                  this.handleGetAllFavorites(this.context.userID);
                }
              }}
              className={
                this.state.activeButton === "favorites" ? "active" : ""
              }
            >
              Обране
            </Nav.Link>
          </div>
          <div className="dropdown">
            <button className="dropbtn">Меню</button>
            <div className="dropdown-content">
              {this.context.userID ? (
                <>
                  <a
                    href="#"
                    onClick={() => this.handleClick("library")}
                    className={
                      this.state.activeButton === "library" ? "active" : ""
                    }
                  >
                    Профіль
                  </a>

                  <a
                    href="#"
                    onClick={() => this.handleClick("library")}
                    className={
                      this.state.activeButton === "library" ? "active" : ""
                    }
                  >
                    Налаштування
                  </a>

                  <a
                    onClick={() => {
                      this.handleDownloadCSV(this.context.userID);
                    }}
                    href="#"
                  >
                    Завантажити список в «.csv»
                  </a>

                  <Link
                    onClick={() => {
                      this.context.setUserID(null);
                      toast("Вихід із профілю виконано успішно!");
                    }}
                    to="/"
                  >
                    Вийти з профілю
                  </Link>
                </>
              ) : (
                <Link to="/auth">Вхід / Реєстрація</Link>
              )}
            </div>
          </div>
        </Navbar>

        <img
          className="backgroundImg"
          src={MainMenuImg || "ImgNotFound"}
          alt="RegistrationAndAuthorization"
        />

        <div className="space"></div>
        {/*Відступ (простір) між навбаром та іншими контентами*/}

        {this.state.activeButton === "library" && (
          <div id="globalLibrary" className="positionListOfBooks">
            {this.state.books.map((book, index) => (
              <div className="listOfBooks" key={index}>
                <button
                  type="button"
                  className={`buttonReadAndFavorite ${
                    this.state.isBookSaved[book.bookid] ? "disable" : ""
                  }`}
                  disabled={this.state.isBookSaved[book.bookid]} // Використовуємо стан книжки для визначення, чи відключати кнопку
                  onClick={() => {
                    if (this.context.userID) {
                      this.handleAddToFavorites(
                        this.context.userID,
                        book.bookid,
                      );
                      toast("Збережено!");
                    } else {
                      toast(
                        "Ви повинні авторизуватися / зареєструватися, щоб додати книжку до обраних!",
                      );
                    }
                  }}
                >
                  {this.state.isBookSaved[book.bookid]
                    ? "Додано в обрані"
                    : "Додати в обране"}
                </button>

                <button type="button" className="buttonReadAndFavorite">
                  Читати
                </button>

                <p style={{ marginTop: "-15px" }}>
                  <b className="keyWords">Назва:</b> «{book.title}» <br />
                  <b className="keyWords">Жанр:</b> {book.genres} <br />
                  <b className="keyWords">Автори:</b> {book.authors}
                </p>
              </div>
            ))}
          </div>
        )}

        {this.state.activeButton === "favorites" && (
          <div id="myfavorites" className="positionListOfBooks">
            {this.context.userID ? (
              this.state.savedBooks.length > 0 ? (
                this.state.savedBooks.map((savedBook, index) => (
                  <div className="listOfBooks" key={index}>
                    <button
                      type="button"
                      className="buttonReadAndFavorite"
                      onClick={() => {
                        this.handleDeleteFavorite(
                          this.context.userID,
                          savedBook.bookid,
                        );
                        toast("Книжку видалено з обраних!");
                      }}
                    >
                      Видалити
                    </button>

                    <button type="button" className="buttonReadAndFavorite">
                      Читати
                    </button>

                    <p style={{ marginTop: "-15px" }}>
                      <b className="keyWords">Назва:</b> «{savedBook.title}»{" "}
                      <br />
                      <b className="keyWords">Жанр:</b> {savedBook.genres}{" "}
                      <br />
                      <b className="keyWords">Автори:</b> {savedBook.authors}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "30px",
                    color: "black",
                    textShadow: "1px 1px 1px mediumaquamarine",
                    fontFamily: "Book Antiqua, sans-serif",
                  }}
                >
                  Ваш список обраних книжок порожній!
                </p>
              )
            ) : (
              <p
                style={{
                  fontSize: "30px",
                  color: "black",
                  textShadow: "1px 1px 1px mediumaquamarine",
                  fontFamily: "Book Antiqua, sans-serif",
                }}
              >
                Щоб переглядати, додавати та видаляти обрані книжки увійдіть /
                зареєструйтеся!
              </p>
            )}
          </div>
        )}

        <ToastContainer />
      </div>
    );
  }
}

export default withNavigation(MainMenu);
