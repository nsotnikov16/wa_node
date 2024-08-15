const router = require('express').Router();

const {
  init, resultInit, logout,
} = require('../controllers/client');

router.get('/init', init);
router.get('/init/:clientId/result', resultInit);
router.get('/logout/:clientId', logout);

module.exports = ('/', router);