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

class RegPage extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      email: "@gmail.com",
      pwd: "",
      isAdmin: false,
    };

    this.handlePressInputRegEmail = this.handlePressInputRegEmail.bind(this);
    this.handleInputChange = {
      handleInputChangeRegEmail:
        this.handleInputChange.handleInputChangeRegEmail.bind(this),
      handleInputChangeRegPwd:
        this.handleInputChange.handleInputChangeRegPwd.bind(this),
    };
    this.handleForbiddenKeys = {
      handleForbiddenKeysRegEmail:
        this.handleForbiddenKeys.handleForbiddenKeysRegEmail.bind(this),
    };
    this.validateForm = {
      validateFormEmptyRows: this.validateForm.validateFormEmptyRows.bind(this),
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
  }

  handleInputChange = {
    handleInputChangeRegEmail: (event) => {
      this.setState({
        [event.target.name]: event.target.value,
      });
    },

    handleInputChangeRegPwd: (event) => {
      this.setState({
        [event.target.name]: event.target.value,
      });
    },
  };

  handleForbiddenKeys = {
    handleForbiddenKeysRegEmail: (event) => {
      const forbiddenChars = /[^a-zA-Z0-9]/; // Дозволені символи
      if (forbiddenChars.test(event.key)) {
        event.preventDefault();
      }
    },
  };

  handlePressInputRegEmail = (event) => {
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
        .post("http://localhost:3001/form-data-register", this.state, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.message) {
            toast(`${response.data.message}`);
          } else {
            // Користувач успішно зареєстрований, перенаправити на головну сторінку
            this.context.setUserID(response.data.user.userID); // Зберігаємо UserID в sessionStorage
            console.log(`userID встановлено: ${response.data.user.userID}`);
            toast(
              "Реєстрація виконана успішно!\nПеренаправляємо Вас на головну сторінку",
            );
            setTimeout(() => {
              this.props.navigate("/#globalLibrary");
              this.setState({ activeButton: "library" });
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

            <p className="authAndRegName">Реєстрація</p>

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
                onInput={this.handlePressInputRegEmail}
                onKeyPress={
                  this.handleForbiddenKeys.handleForbiddenKeysRegEmail
                }
                onChange={this.handleInputChange.handleInputChangeRegEmail}
                required
              />
            </div>

            <div className="form-group inputStyle">
              <p>
                <b style={{ color: "red" }}>*</b>Придумайте надійний пароль:
              </p>
              <input
                type="password"
                className="form-control"
                id="userPwd"
                placeholder="Наприклад: 82sf4$5nj34n3#6b"
                name="pwd"
                maxLength="50"
                minLength="8"
                title="Заповніть обов`язкове поле"
                value={this.state.pwd}
                onChange={this.handleInputChange.handleInputChangeRegPwd}
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
              Вже маєте власний профіль?
              <Link to="/auth" className="linkTips">
                {" "}
                Увійдіть!{" "}
              </Link>
            </p>
          </form>
        </div>

        <ToastContainer />
      </div>
    );
  }
}

export default withNavigation(RegPage);
