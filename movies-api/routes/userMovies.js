const express = require('express');
const UserMoviesService = require('../services/userMovies');
const passport = require('passport')

const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

const { movieIdSchema } = require('../utils/schemas/movies');
const { userIdSchema } = require('../utils/schemas/users');
const  { createUserMovieSchema } = require('../utils/schemas/userMovies');

//ESTRATEGIA DE JWT
require('../utils/auth/strategies/jwt');

function userMoviesApi(app){
  const router = express.Router()
  app.use('/api/user-movies', router)
  const userMoviesService = new UserMoviesService()

  router.get('/', passport.authenticate('jwt', {session: false}), scopesValidationHandler(['read:user-movies']), validationHandler({ userId: userIdSchema}, 'query'),
  async function (req, res, next) {
    const { userId } = req.query
    try {
      const userMovies = await userMoviesService.getUserMovies({ userId })
      res.status(200).json({
        data: userMovies,
        message: 'User movies listed!'
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/', passport.authenticate('jwt', {session: false}), scopesValidationHandler(['create:user-movies']), validationHandler(createUserMovieSchema), async function (req, res, next){
    const { body: userMovie } = req
    try {
      const createUserMovieId = await userMoviesService.createUserMovie({userMovie})
      res.status(201).json({
        data: createUserMovieId,
        message: 'User movie created!'
      })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:userMovieId', passport.authenticate('jwt', {session: false}), scopesValidationHandler(['delete:user-movies']), validationHandler({ userMovieId: movieIdSchema }, 'params'), 
  async function (req, res, next) {
    const { userMovieId} = req.params
    try {
      const deletedUserMovieId = await userMoviesService.deleteUserMovie({
        userMovieId
      })
      res.status(200).json({
        data: deletedUserMovieId,
        message: 'User movie deleted!'
      })
    } catch (error) {
      next(error)
    }
  })
}
module.exports = userMoviesApi;