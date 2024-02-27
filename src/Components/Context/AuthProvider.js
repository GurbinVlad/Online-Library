import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [userID, setUserID] = useState(null);

  // Завантажуємо userID з sessionStorage при завантаженні компонента
  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
    }
  }, []);

  // Зберігаємо userID в sessionStorage, коли він змінюється
  useEffect(() => {
    if (userID) {
      sessionStorage.setItem("userID", userID);
      console.log(`userID збережено в sessionStorage: ${userID}`);
    } else if (sessionStorage.getItem("userID")) {
      sessionStorage.removeItem("userID");
      console.log(
        `userID в sessionStorage визначено як: "${userID}" - сесію користувача видалено!`,
      );
    }
  }, [userID]);

  return (
    <AuthContext.Provider value={{ userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
