const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const User = require("../models/UserModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Kết nối đến MongoDB của bạn
const MONGODB_URI =
  "mongodb+srv://tqk28082k3:TQKhai21522185@cluster0.xfe0b6z.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

describe("UserService", () => {
  afterAll(() => {
    mongoose.disconnect();
  });

  describe("loginUser", () => {
    it("should return an error if user does not exist", async () => {
      const nonExistentEmail = "nonexistent@example.com";
      const userLogin = {
        email: nonExistentEmail,
        password: "password",
      };

      const result = await UserService.loginUser(userLogin);

      expect(result).toEqual({
        status: "ERR",
        message: "User is not exist",
      });
    });

    it("should return an error if password is incorrect", async () => {
      const userLogin = {
        email: "test@gmail.com",
        password: "wrongPassword",
      };

      const result = await UserService.loginUser(userLogin);

      expect(result).toEqual({
        status: "ERR",
        message: "The password or user is incorrect",
      });
    });

    it("should return success if user and password are correct", async () => {
      const userLogin = {
        email: "test@gmail.com",
        password: "123",
      };

      const result = await UserService.loginUser(userLogin);
      console.log(result, "result");

      expect(result.status).toEqual("OK");
      expect(result.message).toEqual("LOGIN SUCCESS");
    });
  });

  describe("UserService.createUser", () => {
    function generateRandomString(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
    }

    const randomString = generateRandomString(4);

    it("should register successfully", async () => {
      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "123",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);
      expect(result.status).toEqual("OK");
    });

    it("should register failed in case email already exist", async () => {
      const data = {
        name: randomString,
        email: "test@gmail.com",
        password: "123",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);

      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual("The email is already");
    });

    it("should register failed in case email is empty", async () => {
      const data = {
        name: randomString,
        email: "",
        password: "123",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);

      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual("The input is required");
    });

    it("should register failed in case password is empty", async () => {
      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);

      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual("The input is required");
    });

    it("should register failed in case password is empty", async () => {
      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);

      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual("The input is required");
    });

    it("should register failed in case password and confirmPassword is not the same", async () => {
      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "1234",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const result = await UserService.createUser(data);

      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual(
        "The password and confirmPassword is not the same"
      );
    });
  });

  describe("getDetailUser", () => {
    it("should fetch details user successfully", async () => {
      const result = await UserService.getDetailsUser(
        "664b678e48aa92aa6e00d3d3"
      );
      expect(result).toHaveProperty("status", "OK");
      expect(result).toHaveProperty("message", "SUCESS");
    });

    it("should fetch user failed in case user is not exist", async () => {
      const result = await UserService.getDetailsUser(
        "60f3b3b3b3b3b3b3b3b3b3b3"
      );
      expect(result).toHaveProperty("status", "ERR");
      expect(result).toHaveProperty("message", "The user is not defined");
    });
  });

  describe("getUserCart", () => {
    it("should fetch user cart successfully", async () => {
      const result = await UserService.getUserCart("664b678e48aa92aa6e00d3d3");
      if (result) {
        expect(result).toHaveProperty("status", "OK");
        expect(result).toHaveProperty("message", "SUCCESS");
      }
    });

    it("should fetch user cart failed in case cart not found", async () => {
      const result = await UserService.getUserCart("664b678e48aa92aa6e00d3d5");
      if (result) {
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "Cart not found");
      }
    });
  });

  describe("createUserCart", () => {
    it("should create user cart successfully", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd781",
        amount: 1,
      };
      const result = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (result) {
        expect(result).toHaveProperty("status", "OK");
        expect(result).toHaveProperty("message", "SUCCESS");
      }
    });

    it("should create user cart successfully with new user", async () => {
      function generateRandomString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
      }

      const randomString = generateRandomString(4);

      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "123",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const resultRegister = await UserService.createUser(data);
      if (resultRegister.status === "OK") {
        const cartData = {
          _id: "661966f05ffdc229d25dd781",
          amount: 1,
        };
        const result = await UserService.createUserCart(
          resultRegister.data._id,
          cartData
        );
        if (result) {
          expect(result).toHaveProperty("status", "OK");
          expect(result).toHaveProperty("message", "SUCCESS");
        }
      }
    });

    it("should create user cart failed in case product not found", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd780",
        amount: 1,
      };

      const result = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (result) {
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "Product not found");
      }
    });
  });

  describe("updateUserCart", () => {
    //userID, productId, newAmount
    it("should add user cart successfully", async () => {
      const amount = 6;
      const result = await UserService.updateUserCart(
        "664b678e48aa92aa6e00d3d3",
        "661966f05ffdc229d25dd781",
        amount
      );
      if (result) {
        if (result) {
          expect(result).toHaveProperty("status", "OK");
          expect(result).toHaveProperty(
            "message",
            "Updated amount of product in cart successfully"
          );
        }
      }
    });

    it("should add user cart fail in case userID is wrong", async () => {
      const amount = 6;
      const result = await UserService.updateUserCart(
        "664b678e48aa92aa6e00d3d4",
        "661966f05ffdc229d25dd781",
        amount
      );
      if (result) {
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "User not found");
      }
    });

    it("should add user cart fail in case productID is wrong", async () => {
      const amount = 6;
      const result = await UserService.updateUserCart(
        "664b678e48aa92aa6e00d3d3",
        "661966f05ffdc229d25dd780",
        amount
      );
      if (result) {
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty(
          "message",
          "Product not found in the cart"
        );
      }
    });
  });

  describe("deleteAllUserCart", () => {
    it("should delete all product in user cart successfully", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd781",
        amount: 1,
      };
      const resultAdd = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (resultAdd.status === "OK") {
        const result = await UserService.deleteAllProductInCart(
          "664b678e48aa92aa6e00d3d3"
        );
        expect(result).toHaveProperty("status", "OK");
        expect(result).toHaveProperty(
          "message",
          "Deleted all products in cart successfully"
        );
      }
    });

    it("should delete all product in user cart failed in case user ID is invalid", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd781",
        amount: 1,
      };
      const resultAdd = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (resultAdd.status === "OK") {
        //user id is invalid
        const result = await UserService.deleteAllProductInCart(
          "664b678e48aa92aa6e00d3d4"
        );
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "User not found");
      }
    });
  });

  describe("deleteAProductUserCart", () => {
    it("should delete all product in user cart successfully", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd781",
        amount: 1,
      };
      const resultAdd = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (resultAdd.status === "OK") {
        const result = await UserService.deleteProductUserCart(
          "664b678e48aa92aa6e00d3d3", //userID
          "661966f05ffdc229d25dd781" //productID
        );
        expect(result).toHaveProperty("status", "OK");
        expect(result).toHaveProperty(
          "message",
          "Deleted product from cart successfully"
        );
      }
    });

    it("should delete product in user cart failed in case user ID is invalid", async () => {
      const cartData = {
        _id: "661966f05ffdc229d25dd781",
        amount: 1,
      };
      const resultAdd = await UserService.createUserCart(
        "664b678e48aa92aa6e00d3d3",
        cartData
      );
      if (resultAdd.status === "OK") {
        //user id is invalid
        const result = await UserService.deleteProductUserCart(
          "664b678e48aa92aa6e00d3d4", //invalid userID
          "661966f05ffdc229d25dd781" //productID
        );
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "User not found");
      }
    });

    it("should delete product in user cart failed in case product ID is not in cart", async () => {
      //user id is invalid
      const result = await UserService.deleteProductUserCart(
        "664b678e48aa92aa6e00d3d3", //userID
        "661966f05ffdc229d25dd788" //productID not in cart
      );
      expect(result).toHaveProperty("status", "ERR");
      expect(result).toHaveProperty("message", "Product not found in the cart");
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      function generateRandomString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
      }

      const randomString = generateRandomString(4);

      const data = {
        name: randomString,
        email: `${randomString}TQK@gmail.com`,
        password: "123",
        confirmPassword: "123",
        phone: "0389346149",
      };
      const resultRegister = await UserService.createUser(data);
      if (resultRegister.status === "OK") {
        const UserId = resultRegister.data._id;

        const result = await UserService.deleteUser(UserId);
        if (result) {
          console.log("result.data", result);
          expect(result.status).toEqual("OK");
        }
      }
    });

    it("should delete a user failed", async () => {
      const result = await UserService.deleteUser("664c7f41f56f546b4a76b219");
      if (result) {
        console.log("result.data", result);
        expect(result).toHaveProperty("status", "ERR");
        expect(result).toHaveProperty("message", "The user is not defined");
      }
    });
  });

  describe("getAll", () => {
    it("should fetch user successfully", async () => {
      const result = await UserService.getAllUser();
      if (result) {
        expect(result).toHaveProperty("status", "OK");
      }
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const data = {
        name: "TQK DEPZAI quaaazzz",
      };

      const result = await UserService.updateUser(
        "664c7f41f56f546b4a76b218", // userID
        data
      );
      if (result) {
        expect(result.status).toEqual("OK");
      }
    });

    it("should update user failed in case id is not definded", async () => {
      const data = {
        name: "TQK DEPZAI quaaazzz",
      };

      const result = await UserService.updateUser(
        "664c7f41f56f546b4a76b219", // userID
        data
      );
      if (result) {
        expect(result.status).toEqual("ERR");
      }
    });
  });

  describe("refreshToken", () => {
    it("should refresh token is successfully", async () => {
      const data = {
        email: "test@gmail.com",
        password: "123",
      };
      const result = await UserService.loginUser(data);
      if (result.status === "OK") {
        const data = await JwtService.refreshTokenJwtService(
          result.refresh_token
        );
        expect(data.status).toEqual("OK");
        expect(data.message).toEqual("SUCESS");
      }
    });

    it("should refresh token is failed", async () => {
      const data = {
        email: "test@gmail.com",
        password: "123",
      };
      const result = await UserService.loginUser(data);
      if (result.status === "OK") {
        const data = await JwtService.refreshTokenJwtService(
          result.access_token
        );
        expect(data.status).toEqual("ERR");
        expect(data.message).toEqual("The authemtication");
      }
    });
  });
});
