import MainMenuImg from "../../Img/MainMenu/BackgroundImgMainMenu(Reverse).jpeg";
import { Link, useNavigate } from "react-router-dom";
import React, { Component } from "react";
import "../../Stylesheet/MainMenu/MainMenu.css";
import "react-toastify/dist/ReactToastify.css";
import { Navbar, Nav } from "react-bootstrap";
import AuthContext from "../Context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

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
    };

    this.handleClick = this.handleClick.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
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
  }

  // Функція для додавання книги до обраних
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
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleGetAllFavorites() {
    if (this.context.userID !== null) {
      fetch("/form-data-savedBooks/" + this.context.userID)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          // Перевірка, чи відповідь містить JSON
          console.log(response.url);
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
          } else {
            // Якщо відповідь не містить JSON, вивести вміст відповіді
            return response.text().then((text) => {
              console.log(text);
              throw new Error("Oops, we haven't got JSON!");
            });
          }
        })
        .then((savedBooks) => {
          this.setState({ savedBooks }, () => {
            console.log(this.state.savedBooks);
          });
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error,
          );
        });
    }
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
                  this.handleGetAllFavorites();
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
                  className="buttonReadAndFavorite"
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
                  Додати в обране
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
                this.state.savedBooks.map((savedbook, index) => (
                  <div className="listOfBooks" key={index}>
                    <button type="button" className="buttonReadAndFavorite">
                      Видалити
                    </button>

                    <button type="button" className="buttonReadAndFavorite">
                      Читати
                    </button>

                    <p style={{ marginTop: "-15px" }}>
                      <b className="keyWords">Назва:</b> «{savedbook.title}»{" "}
                      <br />
                      <b className="keyWords">Жанр:</b> {savedbook.genres}{" "}
                      <br />
                      <b className="keyWords">Автори:</b> {savedbook.authors}
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
