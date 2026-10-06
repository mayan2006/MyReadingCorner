const Category = require("../Models/CategoryModel");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const getAllCategorys = async (req, res) => {
    const allCategorys = await Category.find();
    res.status(200).send(allCategorys);
};

const getCategoryById = async (req, res) => {
    const category = await Category.findById(req.params.id);
    res.status(200).send(category);
};

const deleteCategory = async (req, res) => {
    const category = await Category.deleteOne({ categoryCode: req.params.categoryCode });
    res.status(200).send("category deleted " + category);
};

const addNewCategory = async (req, res) => {
    const newCategory = new Category({ ...req.body });
    await newCategory.save();
    res.status(200).send({ message: "category added to DB", category: newCategory });
};

const updateCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError(404, "category not found");
    }
    category.set({ ...req.body });
    await category.save();
    res.status(200).send({ message: "category updated", updatedCategory: category });
};

module.exports = wrapAsync({
    getAllCategorys,
    getCategoryById,
    deleteCategory,
    addNewCategory,
    updateCategory
});
