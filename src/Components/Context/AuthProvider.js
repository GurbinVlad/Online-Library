import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [userID, setUserID] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false); // Новий стан для відслідковування завантаження userID

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
    }
    setIsLoaded(true); // Встановлюємо isLoaded в true після завантаження userID
  }, []);

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

  // Рендеримо дітей тільки тоді, коли userID завантажено
  return isLoaded ? (
    <AuthContext.Provider value={{ userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  ) : null;
};

export default AuthProvider;
