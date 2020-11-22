// IMPORT MODULES NODEJS
const { check } = require('express-validator');
const minPassword = process.env.PASS_LONG || 6;
// EXPORTING MODULE
module.exports = {
	userLoginValidator: [
		check('email').isEmail(),
		check('password').isLength({ min: minPassword })
	],
	userCreateValidator: [
		check('email').isEmail(),
		check('password').isLength({ min: minPassword }),
		check('username').notEmpty(),
		check('name').notEmpty(),
		check('surname').notEmpty()
	],
	adminCreateValidator: [
		check('email').isEmail(),
		check('username').notEmpty(),
		check('name').notEmpty(),
		check('surname').notEmpty(),
		check('authorization').notEmpty()
	],
	getUser:[
		check('authorization').notEmpty()
	],
	resetPassword:[
		check('authorization').notEmpty(),
		check('password').isLength({ min: minPassword })
	],
	logout:[
		check('authorization').notEmpty()
	],
	posts:[
    	check('authorization').notEmpty(),
	  	check('lang').notEmpty(),
		check('type').notEmpty(),
    	check('title').notEmpty(),
    	check('header').notEmpty(),
    	check('content').notEmpty(),
    	check('visible').isBoolean()
	],
  	numberPosts: [
    	check('authorization').notEmpty()
  	],
  	numberMailSub: [
    	check('authorization').notEmpty()
  	],
  	getChatsUsersNumbers: [
    	check('authorization').notEmpty()
  	],
  	getEarningNumber: [
    	check('authorization').notEmpty()
  	],
  	getPostsData: [
    	check('authorization').notEmpty()
	],
	createCategory: [
		check('authorization').notEmpty(),
		check('name').notEmpty(),
		check('description').notEmpty(),
		check('titleSeo').notEmpty(),
		check('important').notEmpty(),
		check('visible').isBoolean()
	],
	getAllCategory: [
		check('authorization').notEmpty()
	],
	getCategoryWithFilter: [
		check('authorization').notEmpty()
	],
	createSubcategory: [
		check('authorization').notEmpty(),
		check('codCategoryPrincipal').notEmpty(),
		check('name').notEmpty(),
		check('description').notEmpty(),
		check('titleSeo').notEmpty(),
		check('important').notEmpty(),
		check('visible').isBoolean()
	],
	modifyCategory: [
		check('codCategory').notEmpty(),
		check('authorization').notEmpty(),
		check('name').notEmpty(),
		check('description').notEmpty(),
		check('titleSeo').notEmpty(),
		check('important').notEmpty(),
		check('visible').isBoolean()
	],
	deleteCategory: [
		check('codCategory').notEmpty(),
		check('authorization').notEmpty()
	],
	imageUpload:[
		check('authorization').notEmpty()
	],
	uploadFile: [
		check('authorization').notEmpty()
	],
	getImagesList: [
		check('authorization').notEmpty()
	],
	getFilesList: [
		check('authorization').notEmpty()
	],
};
