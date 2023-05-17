'use strict'

const express = require('express');
const api = express.Router();
const userController = require('./user.controller');
const { ensureAuth, isAdmin } = require('../services/authenticated');
const connectMultiparty = require('connect-multiparty')
const upload = connectMultiparty({uploadDir: './uploads/users'})


//==============================================Rutas públicas===========================
api.put('/uploadImage/:id', upload, userController.addImage)
api.get('/getUsers', userController.getUsers)
api.get('/getImage/:fileName', upload, userController.getImage)
api.post('/login', userController.login);

//==============================================Para cliente Unicamente=======================
api.post('/register', userController.register);
api.post('/search/:id', userController.searchHotelAndVook);


//===============================================Rutas solo de Admin=================
api.put('/update/:id', userController.update);
api.delete('/delete/:id', userController.delete);
//Funcion del ADMIN para crear un administrador de un hotel
api.post('/save', userController.save);
//Funcion para ver todos los usurios registrados ROL CLIENTE
api.get('/seeUsers', userController.seeRegisteredUsersClient)
//Funcion para ver todos los usurios registrados ROL ADMIN_HOTEL
api.get('/seeUsersAdmin', userController.seeRegisteredUsersAdminHotel)

//===============================================Rutas solo de Admin_HOTEL=================
//Agregar habitaciones a un hotel
api.put('/addRoomsHotel/:id', userController.addRooms)
api.put('/addEvents/:id', userController.addEvents)

module.exports = api;

