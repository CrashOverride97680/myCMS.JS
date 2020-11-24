// IMPORT MODULES NODEJS
const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');
const auth = require('../autentication/auth');
const isValid = require('../autentication');
const uploadImg = require('../upload/uploadImg');
const uploadFile = require('../upload/uploadFile');
// ROUTES APP
// -> GET
router
	.get('/getPostsNumbers', auth.numberPosts, isValid.runValidation, controller.getPostsNumbers)
  	.get('/getMailSubNumbers', auth.numberMailSub, isValid.runValidation, controller.getMailSubNumbers)
  	.get('/getChatsNumbers', auth.getChatsUsersNumbers, isValid.runValidation, controller.getChatsUsersNumbers)
  	.get('/getEarningNumber', auth.getEarningNumber, isValid.runValidation, controller.getEarningNumber)
  	.get('/getAllPosts', auth.getPostsData, isValid.runValidation, controller.getAllPosts)
  	.get('/getPosts/:max', auth.getPostsData, isValid.runValidation, controller.getPostsWithFilter)
  	.get('/getVisiblePostNumber', auth.getPostsData, isValid.runValidation, controller.getVisiblePostNumber)
  	.get('/getUnvisiblePostNumber', auth.getPostsData, isValid.runValidation, controller.getUnvisiblePostNumber)
  	.get('/getAllPostsTable', auth.getPostsData, isValid.runValidation, controller.getAllPostsTable)
  	.get('/getAllCategory', auth.getAllCategory, isValid.runValidation, controller.getAllCategory)
	.get('/getCategory/:max', auth.getCategoryWithFilter, isValid.runValidation, controller.getCategoryWithFilter)
	.get('/getListImagesUploaded', auth.getImagesList, isValid.runValidation, controller.getImagesUploaded)
	.get('/getListFilesUploaded', auth.getFilesList, isValid.runValidation, controller.getFilesUploaded);
// -> POST
router
	.post('/login', auth.userLoginValidator, isValid.runValidation, controller.login)
	.post('/register', auth.userCreateValidator, isValid.runValidation, controller.register)
	.post('/registerAdmin', auth.adminCreateValidator, isValid.runValidation, controller.registerAdmin)
	.post('/logout', auth.logout, isValid.runValidation, controller.logout)
	.post('/createCategory', auth.createCategory, isValid.runValidation, controller.createCategorySite)
	.post('/createSubcategory', auth.createSubcategory, isValid.runValidation, controller.createSubCategorySite)
	.post('/createpost', auth.posts, isValid.runValidation, controller.createPost)
	.post('/imgUpload', auth.imageUpload, isValid.runValidation, controller.checkAdminUser, uploadImg.imgUpload, controller.uploadImg)
	.post('/fileUpload', auth.uploadFile, isValid.runValidation, controller.checkAdminUser, uploadFile.fileUpload, controller.uploadFiles);
// -> PUT
router
	.put('/modifyCategory', auth.modifyCategory, isValid.runValidation, controller.modifyCategory)
	.put('/modifyPosts', auth.updatePosts, isValid.runValidation, controller.modifyPosts);
// -> DELETE
router
	.delete('/deleteCategory', auth.deleteCategory, isValid.runValidation, controller.deleteCategory)
	.delete('/removeUser', controller.chechUserAuth, controller.deleteUser);
// -> TEST
if(process.env.NODE_TEST_ADMIN) 
{
	router
		.get('/testToken', controller.sendTestToken)
		.post('/createAdminUser', controller.adminCreateForTesting);
}

if (process.env.NODE_ENV_TEST)
{
	router
		.get('/test', controller.test)
		.get('/secret', controller.requireSignin, controller.secretTest)
		.get('/testmail', controller.testMail);
	router
		.post('/checktoken', controller.checkTokenTest)
		.post('/testimg', uploadImg.test, controller.uploadTest);		
}

if (process.env.NODE_ENV_ALLERT) 
{
	router
		.post('/AllertCreateAdminUser', controller.adminCreateForAllert);
}

// -> 404
router.get('*', controller.notFound);
// EXPORTING ROUTES
module.exports = router;