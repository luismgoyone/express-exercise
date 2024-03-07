const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getUsers);
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.post('/logout', controller.logoutUser);

module.exports = router;
