const { check, param } = require("express-validator");

const productValidation = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ min: 5, max: 100 })
    .withMessage("Name must be 5-100 characters"),

  check("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("Product short description is required.")
    .isLength({ min: 50, max: 500 })
    .withMessage("Short description must be 50-500 characters."),

  check("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number."),
  check("rating")
    .notEmpty()
    .withMessage("rating is required.")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must b/w 1 to 5."),

  check("discountPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a positive number.")
    .custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error("Discount price must be less than regular price.");
      }
      return true;
    }),

  check("length")
    .notEmpty()
    .withMessage("Length is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Length must be a positive number."),

  check("width")
    .notEmpty()
    .withMessage("Width is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Width must be a positive number."),

  check("height")
    .notEmpty()
    .withMessage("Height is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Height must be a positive number."),

  check("weight")
    .notEmpty()
    .withMessage("Weight is required.")
    .isFloat({ min: 0.01 })
    .withMessage("Weight must be a positive number."),

  check("materialType")
    .notEmpty()
    .withMessage("Material type is required.")
    .isIn([
      "WhiteMarble",
      "BlackMarble",
      "GreenMarble",
      "PinkMarble",
      "MakranaMarble",
      "ItalianMarble",
      "Granite",
      "BlackGranite",
      "RedGranite",
      "Sandstone",
      "RedSandstone",
      "YellowSandstone",
      "OnyxStone",
      "Soapstone",
      "Limestone",
      "Alabaster",
      "SlateStone",
      "QuartzStone",
      "Marble Dust"
    ])
    .withMessage("Invalid material type."),

  check("care").notEmpty().withMessage("Care instructions are required."),

  check("category")
    .notEmpty()
    .withMessage("Category is required.")
    .isIn([
      "StatuesIdols",
      "HomeDecor",
      "KitchenDining",
      "GardenOutdoor",
      "CorporateGifts",
      "ReligiousItems",
      "PoojaItems",
      "TempleDecor",
      "WallDecor",
      "TableDecor",
      "Sculptures",
      "HandCarvedArt",
      "MortarPestle",
      "CandleHolders",
      "IncenseHolders",
      "AnimalStatues",
      "BuddhaStatues",
      "GaneshStatues",
      "ShivLing",
      "Planters",
      "Vases",
      "Showpieces",
      "DecorativeBowls",
      "ServingPlatters",
      "Coasters",
      "PaperWeights",
      "LuxuryDecor",
      "GiftSets",
      "Idols & Murtis"
    ])
    .withMessage("Invalid category."),
  check("metaTitle")
    .trim()
    .notEmpty()
    .withMessage("Meta title is required.")
    .isLength({ max: 60 })
    .withMessage("Meta title must be under 60 characters."),

  check("metaDescription")
    .trim()
    .notEmpty()
    .withMessage("Meta description is required.")
    .isLength({ max: 160 })
    .withMessage("Meta description must be under 160 characters."),

  check("keywords").trim().notEmpty().withMessage("Keywords are required."),
];

const productIdValidation = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product id required")
    .isMongoId()
    .withMessage("Product id must be mongoose id."),
];

module.exports = {
  productValidation,
  productIdValidation,
};
