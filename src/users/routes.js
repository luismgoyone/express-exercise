const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getUsers);
router.post('/register', controller.addUser);
router.post('/login', controller.loginUser);

module.exports = router;
