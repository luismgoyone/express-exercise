const { Router } = require('express');
const controller = require('./controller');

const router = Router();

router.get('/users', controller.getUsers);
router.post('/register', controller.addUser);

module.exports = router;
