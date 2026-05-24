const Category=require('../Models/CategoryModel')

const getAllCategorys = async (req, res) => {
    try {
        const allCategorys = await Category.find()
        res.status(200).send(allCategorys)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        res.status(200).send(category)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}

const deleteCategory= async (req, res) => {
    try {
        const category = await Category.deleteOne({ categoryCode: req.params.categoryCode })
        res.status(200).send("category deleted " + category)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const addNewCategory = async (req, res) => {
    try {
        const newCategory = new Category({ ...req.body });
        await newCategory.save();
        res.status(200).send({ message: "category added to DB", category:newCategory });
    } catch (err) {
        res.status(500).send(err);
    }
}
const updateCategory= async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category)
            return res.status(404).send({ message: "category not found" });

        category.set({ ...req.body });
        await category.save();
        res.status(200).send({ message: "category updated", updatedCategory: category });
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {
    getAllCategorys,
    getCategoryById,
    deleteCategory,
    addNewCategory,
    updateCategory
}
