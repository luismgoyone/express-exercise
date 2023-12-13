const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getUsers);
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.post('/logout', controller.logoutUser);
router.get('/posts', controller.getPosts);
router.get('/posts', controller.getUserPosts);
router.post('/add-post', controller.createPost);
router.post('/update-post', controller.updatePost);
router.delete('/delete-post/:id', controller.deletePost);

module.exports = router;
