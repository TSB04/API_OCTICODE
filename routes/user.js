const express = require('express')
const router = express.Router()

const userCtr = require('../controllers/user')
const auth = require('../middleWare/auth');


// Route to signup a user
router.post('/signup', userCtr.createUser)

//Route to login
router.post('/login', userCtr.logUser)

//Route to get all users
router.get('/all', userCtr.getAllUsers)

// Route to get a user
router.post('/user', userCtr.getUser)

// Route to get a logged user
router.post('/loggeduser', auth, userCtr.getLoggedUser)

// Route to update a user
router.put('/update', auth, userCtr.updateUser)

// Route to remove a user
router.delete('/remove', auth , userCtr.deleteUser)

// router.delete('/removeall', userCtr.deleteAlluser)

module.exports = router