import RegistrationAndAuthorization from "../../Img/RegistrationAndAuthorization/BackgroundImgLoginAndRegister.png";
import "../../Stylesheet/RegistrationAndAuthorization/RegistrationAndAuthorization.css";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import React, { Component } from "react";
import axios from "axios";

// Функціональний компонент вищого порядку, який передає navigate як проп
const withNavigation = (Component) => (props) => {
  const navigate = useNavigate();
  return <Component {...props} navigate={navigate} />;
};

class AuthPage extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      email: "@gmail.com",
      pwd: "",
      isAdmin: false,
    };

    this.handlePressInputAuthEmail = this.handlePressInputAuthEmail.bind(this);
    this.handleInputChange = {
      handleInputChangeAuthEmail:
        this.handleInputChange.handleInputChangeAuthEmail.bind(this),
      handleInputChangeAuthPwd:
        this.handleInputChange.handleInputChangeAuthPwd.bind(this),
    };
    this.handleForbiddenKeys = {
      handleForbiddenKeysAuthEmail:
        this.handleForbiddenKeys.handleForbiddenKeysAuthEmail.bind(this),
    };
    this.validateForm = {
      validateFormEmptyRows: this.validateForm.validateFormEmptyRows.bind(this),
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
  }

  handleInputChange = {
    handleInputChangeAuthEmail: (event) => {
      this.setState({
        [event.target.name]: event.target.value,
      });
    },

    handleInputChangeAuthPwd: (event) => {
      this.setState({
        [event.target.name]: event.target.value,
      });
    },
  };

  handleForbiddenKeys = {
    handleForbiddenKeysAuthEmail: (event) => {
      const forbiddenChars = /[^a-zA-Z0-9]/; // Дозволені символи
      if (forbiddenChars.test(event.key)) {
        event.preventDefault();
      }
    },
  };

  handlePressInputAuthEmail = (event) => {
    const input = event.target.value;
    const emailPattern = /^[\w.-]*@gmail.com$/;

    if (emailPattern.test(input)) {
      this.setState({ email: input });
    } else {
      event.target.value = this.state.email;
    }
  };

  validateForm = {
    validateFormEmptyRows() {
      let inputs = document.getElementsByTagName("input");
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
          toast("Будь ласка, заповніть всі обов'язкові поля");
          return false;
        }
      }
      return true;
    },
  };

  handleSubmitForm = (event) => {
    event.preventDefault();
    if (this.validateForm.validateFormEmptyRows()) {
      // Код для обробки даних форми
      let inputs = document.getElementsByTagName("input");
      for (let i = 0; i < inputs.length; i++) {
        console.log(inputs[i].name + ": " + inputs[i].value);
      }

      // Відправка даних форми на сервер
      axios
        .post("http://localhost:3001/form-data-auth", this.state, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.message) {
            toast(`${response.data.message}`);
          } else {
            // Користувач успішно авторизований, перенаправити на головну сторінку
            this.context.setUserID(response.data.user.userID); // Зберігаємо UserID в sessionStorage
            console.log(`userID встановлено: ${response.data.user.userID}`);
            toast(
              "Авторизація виконана успішно!\nПеренаправляємо Вас на головну сторінку",
            );
            setTimeout(() => {
              this.props.navigate("/#globalLibrary");
            }, 4000); // Затримка переходу на 4 секунди
          }
        })
        .catch((error) => {
          if (error.response) {
            // Сервер відповів зі статусом кодом, який виходить за межі діапазону 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            toast(`${error.response.data.message}`);
          } else if (error.request) {
            // Запит було зроблено, але не отримано відповіді
            console.log(error.request);
          } else {
            // Щось сталося при налаштуванні запиту, що спричинило помилку
            console.log("Error", error.message);
          }
          console.error("Error:", error);
        });

      /*// Очистка полів форми
      this.handleClearForm();*/
    }
  };

  handleClearForm = () => {
    this.setState({
      email: "@gmail.com",
      pwd: "",
    });
  };

  render() {
    return (
      <div>
        <img
          className="backgroundImg"
          src={RegistrationAndAuthorization || "ImgNotFound"}
          alt="RegistrationAndAuthorization"
        />

        <div className="divOrderFormMain">
          <form onSubmit={this.handleSubmitForm} method="POST">
            <p className="apiBooksLibraryName">API Books Library</p>
            <p className="authAndRegName">Авторизація</p>
            <div className="form-group inputStyle">
              <p>
                <b style={{ color: "red" }}>*</b>Введіть електронну пошту:
              </p>
              <input
                type="email"
                className="form-control"
                id="userEmail"
                placeholder="Пусте поле"
                name="email"
                title="Заповніть обов`язкове поле"
                value={this.state.email}
                onInput={this.handlePressInputAuthEmail}
                onKeyPress={
                  this.handleForbiddenKeys.handleForbiddenKeysAuthEmail
                }
                onChange={this.handleInputChange.handleInputChangeAuthEmail}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group inputStyle">
              <p>
                <b style={{ color: "red" }}>*</b>Введіть пароль:
              </p>
              <input
                type="password"
                className="form-control"
                id="userPwd"
                placeholder="Пусте поле"
                name="pwd"
                maxLength="50"
                minLength="8"
                title="Заповніть обов`язкове поле"
                value={this.state.pwd}
                onChange={this.handleInputChange.handleInputChangeAuthPwd}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="buttonSubmit">
              Підтвердити
            </button>
            <button
              type="reset"
              className="buttonReset"
              onClick={this.handleClearForm}
            >
              Очистити
            </button>

            <p className="textTips">
              Не маєте профілю?
              <Link to="/register" className="linkTips">
                {" "}
                Зареєструйтеся тут!{" "}
              </Link>
            </p>
          </form>
        </div>

        <ToastContainer />
      </div>
    );
  }
}

export default withNavigation(AuthPage);
