const ProductService = require("../services/ProductService");
const mongoose = require("mongoose");

// Kết nối đến MongoDB của bạn
const MONGODB_URI =
  "mongodb+srv://tqk28082k3:TQKhai21522185@cluster0.xfe0b6z.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

jest.setTimeout(20000);

const randomName = Math.random().toString(36).substring(7);

describe("fetchAllProduct", () => {
  it("should fetch successfully", async () => {
    const products = await ProductService.getAllProduct(20, 1);
    expect(products.status).toEqual("OK");
  });

  it("should fetch successfully with pagination", async () => {
    const products = await ProductService.getAllProduct(10, 1);
    expect(products.status).toEqual("OK");
  });
});

describe("fetchProductDetails", () => {
  it("should fetch data successfully", async () => {
    const result = await ProductService.getDetailsProduct(
      "656b2f924a7494aad73e1c10"
    );
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(false);
  });

  it("should fetch data failed in case productID is not defined", async () => {
    const result = await ProductService.getDetailsProduct(
      "656b2f924a7494aad73e1c11"
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The product is not defined");
  });
});

describe("createProduct", () => {
  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");
  }

  const randomString = generateRandomString(4);
  const data = {
    company: "ASUS",
    countInStock: "13213",
    description: "231",
    image: "link-image",
    name: randomString + "-laptop",
    price: "123000",
    rating: "",
    type: "normal-laptop",
  };

  it("should create product successfully", async () => {
    const result = await ProductService.createProduct(data);
    expect(result).toHaveProperty("status", "OK");
    expect(result).toHaveProperty("message", "SUCCESS");
  });

  it("should create product fail in case the name already exists", async () => {
    const dataTest = {
      company: "ASUS",
      countInStock: "13213",
      description: "231",
      image: "link-image",
      name: "Dell Vostro 15 3520",
      price: "123000",
      rating: "",
      type: "normal-laptop",
    };

    const result = await ProductService.createProduct(dataTest);
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The name of product is already");
  });

  it("should create product fail in case name is empty", async () => {
    const result = await ProductService.createProduct({
      company: "ASUS",
      countInStock: "123",
      description: "123",
      image: "123",
      name: "",
      price: "123000",
      //rating: "",
      type: "normal-laptop",
    });
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });
});

describe("updateProduct", () => {
  it("should update Product successfully", async () => {
    const changeData = {
      name: randomName + "-updatedlaptop",
      type: "normal-laptop",
      company: "ASUS",
      price: 123000,
      countInStock: 13213,
      description: "231",
      image: "link-image",
    };

    const id = "661966f05ffdc229d25dd781";
    const result = await ProductService.updateProduct(id, changeData);
    expect(result.status).toEqual("OK");
  });

  it("should update product failed in case name is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326", // id
      {
        name: "",
        type: "normal-laptop",
        company: "ASUS",
        price: 123000,
        countInStock: 13213,
        description: "231",
        image: "link-image",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });
  it("should update product failed in case image is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326",
      {
        name: "test-product",
        type: "normal-laptop",
        company: "ASUS",
        price: 123000,
        countInStock: 13213,
        description: "231",
        image: "",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });

  it("should update product failed in case type is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326",
      {
        name: "test-ptoduct",
        type: "",
        company: "ASUS",
        price: 123000,
        countInStock: 13213,
        description: "231",
        image: "link-image",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });

  it("should update product failed in case company is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326",
      {
        name: "test-ptoduct",
        type: "normal-laptop",
        company: "",
        price: 123000,
        countInStock: 13213,
        description: "231",
        image: "link-image",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });

  it("should update product failed in case price is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326",
      {
        name: "test-ptoduct",
        type: "normal-laptop",
        company: "ASUS",
        price: "",
        countInStock: 13213,
        description: "231",
        image: "link-image",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });

  it("should update product failed in case description is empty", async () => {
    const result = await ProductService.updateProduct(
      "664d88fdb24110a0e6720326",
      {
        name: "test-ptoduct",
        type: "normal-laptop",
        company: "ASUS",
        price: 123000,
        countInStock: 13213,
        description: "",
        image: "link-image",
      }
    );
    expect(result).toHaveProperty("status", "ERR");
    expect(result).toHaveProperty("message", "The input is required");
  });
});

describe("deleteProduct", () => {
  it("should delete product successfully", async () => {
    const data = {
      company: "ASUS",
      countInStock: "13213",
      description: "231",
      image: "link-image",
      name: randomName + "-laptop",
      price: "123000",
      rating: "",
      type: "normal-laptop",
    };
    const resultCreate = await ProductService.createProduct(data);
    if (resultCreate.status === "OK") {
      const result = await ProductService.deleteProduct(resultCreate.data._id);
      expect(result.status).toEqual("OK");
    }
  });

  it("should delete product failed in case id is null", async () => {
    try {
      const result = await ProductService.deleteProduct("");
      expect(result.status).toEqual("ERR");
      expect(result.message).toEqual("The id is required");
    } catch (error) {}
  });

  it("should delete product failed in case id is not vaialbe", async () => {
    const result = await ProductService.deleteProduct("noewan5y43fd");
    expect(result.status).toEqual("ERR");
    expect(result.message).toEqual("The product is not defined");
  });
});

describe("fetchAllType", () => {
  it("should fetch all type successfully", async () => {
    const result = await ProductService.getAllType();
    console.log(result, "result");
    expect(result.status).toEqual("OK");
    expect(result.message).toEqual("Success");
    expect(result.data).toEqual(expect.any(Array));
  });
});

describe("fetchAllCommentAndRating", () => {
  it("should fetch all comment successfully", async () => {
    const result = await ProductService.getCommentAndRating(
      "656b2f924a7494aad73e1c10"
    );
    expect(result.status).toEqual("OK");
    expect(result.message).toEqual("Success");
    expect(result.data).toEqual(expect.any(Array));
  });
});
