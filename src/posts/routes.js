const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/posts', controller.getPosts);
router.get('/:id/posts', controller.getUserPosts);
router.post('/:id/posts', controller.createPost);
router.post('/update-post/:id', controller.updatePost);
router.delete('/delete-post/:id', controller.deletePost);

module.exports = router;
