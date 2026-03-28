const mongoose = require("mongoose");

const productModel = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },

    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    discountPrice: { type: Number, required: true, min: 0 },

    // Dimensions
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },

    // Product details
    materialType: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    care: { type: [String], required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "StatuesIdols",
        "HomeDecor",
        "KitchenDining",
        "SilBatta",
        "ChaklaBelan",
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
      ],
    },

    // Images - changed to array for multiple images
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    // SEO
    metaTitle: { type: String, required: true, maxlength: 60 },
    metaDescription: { type: String, required: true, maxlength: 160 },
    keywords: { type: String, required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

const Product = mongoose.model("Product", productModel);
module.exports = Product;
