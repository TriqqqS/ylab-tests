import StoreModule from "../module";

/**
 * Детальная информация о текущем пользователе
 */
class SessionState extends StoreModule {
  initState() {
    return {
      username: "",
      authorized: false,
      token: "",
      error: "",
      waiting: false,
    };
  }

  clearData() {
    this.setState(
      {
        username: "",
        authorized: false,
        error: "",
        waiting: false, // признак ожидания загрузки
      },
      "Стейт пользователя очищен"
    );
  }

  clearError() {
    this.setState(
      {
        ...this.getState(),
        error: "",
      },
      "Поле ошибки очищено"
    );
  }

  /**
   * Запрос авторизации к серверу и получение токена
   * @param authData {{username: String, password: String}}
   * @return {Promise<void>}
   */
  async getToken(authData) {
    this.setState({
      ...this.getState(),
      authorized: false,
      token: "",
      error: "",
      waiting: true,
    });

    try {
      const response = await fetch(`/api/v1/users/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: authData.username,
          password: authData.password,
          remember: true,
        }),
      });

      if (response.ok) {
        const json = await response.json();

        localStorage.setItem("token", json.result.token);

        this.setState(
          {
            ...this.getState(),
            username: json.result.user.username,
            authorized: true,
            token: json.result.token,
            waiting: false,
          },
          "Токен авторизации получен"
        );
        console.log(json.result);
      } else {
        const json = await response.json();

        this.setState(
          {
            ...this.getState(),
            error: json.error.data.issues[0].message,
            waiting: false,
          },
          "Ошибка авторизации"
        );
      }
    } catch (e) {
      console.log("Application error");
      this.setState({
        ...this.getState(),
        data: {},
        error: "Application error",
        waiting: false,
      });
    }
  }

  /**
   * Получение данных своего профиля
   * @return {Promise<void>}
   */
  async getName() {
    this.setState({
      ...this.getState(),
      name: "",
      waiting: true,
    });

    try {
      const response = await fetch(`/api/v1/users/self?fields=profile(name)`, {
        headers: {
          "X-token": localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const json = await response.json();
        // Данные профиля загружены успешно
        this.setState(
          {
            ...this.getState(),
            name: json.result.profile.name,
            waiting: false,
          },
          "Загружены данные профиля"
        );
      } else {
        this.setState(
          {
            ...this.getState(),
            error: response.statusText,
          },
          "Ошибка при загрузке данных профиля"
        );
      }
    } catch (e) {
      console.log("Application error");
      this.setState({
        ...this.getState(),
        error: "Application error",
        waiting: false,
      });
    }
  }
}

export default SessionState;
