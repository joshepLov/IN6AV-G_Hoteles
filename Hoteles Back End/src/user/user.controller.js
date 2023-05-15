'use strict'

const User = require('./user.model');
const Hotel = require('../hotel/hotel.model');
const Room = require('../room/room.model');
const Services = require('../AdittionalsHoteles/servicios.model');
const Reservation = require('../reservation/reservation.model');

const { validateData, encrypt, checkPassword } = require('../utils/validate');
const { createToken } = require('../services/jwt');
const fs = require('fs')
const path = require('path')


//===============FUNCIONES UNICAMENTE DE ADMINISTRADOR==================//

//Usuario Admin Por defecto
exports.userDefault = async()=>{
    try{
        let data = {
            name: 'admin',
            surname: '418',
            username: 'admin',
            password: 'admin',
            email: 'admin@gmail.com',
            phone: '12345678',
            role: 'ADMIN',
            image: ''
        }
        data.password = await encrypt(data.password)
        let existDefault = await User.findOne({name: data.name});
        let addDefault;
        (existDefault) 
         ? ( console.log(`Admin ${data.name} creado por default`) )
         :  (addDefault = new User(data),
            await addDefault.save(),
            console.log('Usuario ADMIN creado por Default'))


    }catch(e){
        console.error(e);
        return res.status(500).send({message: 'Error server'})
    }
}

//El administrador puede ver todos los usuarios registrados con rol cliente//

exports.seeRegisteredUsersClient = async(req, res)=>{
    try{
        let userGet = await User.find({role: 'CLIENT'})
        return res.send({message: 'Todos los usuarios registrados :', userGet});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting product'});
    }
}

//El administrador puede ver todos los usuarios registrados con rol ADMIN_hOTEL

exports.seeRegisteredUsersAdminHotel = async(req, res)=>{
    try{
        let userGet = await User.find({role: 'ADMIN_HOTEL'})
        return res.send({message: 'Todos los usuarios registrados :', userGet});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting product'});
    }
}



//El administrador puede ver todos los usuarios registrados con rol ADMIN_HOTEL//

exports.seeRegisteredUsersAdmin = async(req, res)=>{
    try{
        let userGet = await User.find({role: 'ADMIN_HOTEL'})
        return res.send({message: 'Todos los usuarios registrados:', userGet});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting product'});
    }
}

//=========================== FUNCIONES SOLO DE CLIENTE ================================

//Registro Unicamente para Cliente se le agrega rol CLIENT por defecto no se puede cambiar
exports.register = async(req, res)=>{
    try{
        //Capturar el fomulario de registro (Body)
        let data = req.body;
        let params = {
            password: data.password,
        }
        let validate = validateData(params);
        if(validate) return res.status(400).send(validate);
        //Role predefinido
        data.role = "CLIENT";
        //Encriptar contraseña
        data.password = await encrypt(data.password)
        //Guardar la información
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating account', error: err.message})
    }
}

// El usuario puede buscar el hotel y realizar la reservación.

exports.searchHotelAndVook = async(req, res)=>{
    try{
        let userId = req.params.id
        // let data = req.body;
        //verificar que el usario existe
        let existUser = await User.findOne({_id: userId})
        if(!existUser) return res.send({message: 'this user does not exist'})
        //va a buscar el hotel por nombre
        let data = req.body
        let hotel = await Hotel.findOne({name: data.name} || {address: data.address })
        if(!hotel) return res.status(500).send({message: 'Hotel not Found '})
        //encuentra el hotel y hace la reservacion    
          //verificar que el rol de usuario solo sera cliente
          if(existUser.role !== 'CLIENT') return res.send({message: 'Register to reserve a room'}) //Si no es rol CLIENTE no puede reservar
          //Verifica que si la habitacion que va a reservar exista
          let existRoom = await Room.findOne({_id: data.room})
          if(!existRoom) return res.send({message: 'this room does not exist'})
          if(existRoom.name == 'Default') return res.send({message: 'this room is not possible to book'})      
          //verifica que los servicion que va adquirir existen
          let existServ = await Services.findOne({_id: data.services})
          if(!existServ) return res.send({message: 'this service does not exist'})  
          //Verificar que la fecha que sea de fin no sea menor a la de inicio de la reservacion
          if(data.endingDate <= data.starDtate) return res.send({message: 'la fecha de al finalizar el hospedaje no puede ser menor a la de inicio'}) 
          //Verificar que la habitacion adquirir sea de ese hotel
          let product = hotel.room;
          //Verificar que no se repitan los productos
          for (let i = 0; i <= product.length; i++) {
              if(product[i] !== data.room) console.log('se queda aqui')
               console.log(1)
          }
          console.log('avanzo hasta aca')
          //actualiza el status a false al reservar
          let updateRoom = await Room.findOneAndUpdate(
              {_id: existRoom._id},
              {status: false},
              {new: true}
              ) 
          if(!updateRoom) return res.status(404).send({message:'Error al cambiar status'});
          //verificar que si el estado el falso no se pueda reservar
          if(existRoom.status == false) return res.status(404).send({message:'This room cannot be reserved'});
          //Guardar Reser
          data.total = 0;
          let reservation = new Reservation(data)
          await reservation.save()
          return res.send({mmesage: 'Reservation saved succesfully'})




        return res.send({message: 'Hotel Found ', hotel})
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting product'});
    }
}












//================================ FUNCIONES UNICAMENTE PARA ADMINISTRADOS_HOTEL=====================


//Registro Unicamente para un ADMINISTRADOR DE UN HOTEL con rol ADMIN_HOTEL por defecto no se puede cambiar
exports.save = async(req, res)=>{
    try{
        //Capturar el fomulario de registro (Body)
        let data = req.body;
        let params = {
            password: data.password,
        }
        let validate = validateData(params);
        if(validate) return res.status(400).send(validate);
        //Role predefinido
        data.role = 'ADMIN_HOTEL';
        //Encriptar contraseña
        data.password = await encrypt(data.password)
        //Guardar la información
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating account', error: err.message})
    }
}

<<<<<<< HEAD


=======
//Funcion de agregar habitaciones a un hotel

exports.addRooms = async(req, res)=>{
    try{
        //ID DEL ADMIN HOTEL
        let userId = req.params.id
        //VA A IR A BUSCAR EL ID QUE TENGA ESE HOTEL
        let hotel = await Hotel.findOne({admin: userId})
        if(!hotel) return res.status(500).send({message: 'Hotel not Found '})
        //Crear la habitacion
        let data = req.body;
        let existRoom = await Room.findOne({name: data.name})
        if(existRoom){
            return res.send({message: 'Room alredy created'})
        }
        data.status = true;
        data.image = "";
        let roomagregate = new Room(data)
        await roomagregate.save()
       // AGREGAR LA HABITCION AL HOTEL
        let addRoom = await Hotel.findOneAndUpdate(
            {_id: hotel._id},
            {$push:{
            room: roomagregate._id
            }},
            {new: true}
        )
        return res.send({message: 'Room saved succesfully', addRoom})
     }catch(err){
        console.error(err)
        return res.status(500).send({message: 'error adding rooms'})
    }
}

//====================================FUNCIONES GENERALES================================
>>>>>>> jmorales
//Funcion para todos los usarios 

exports.login = async(req, res)=>{
    try{
        let data = req.body;
        let credentials = { 
            username: data.username,
            password: data.password
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send(msg)
        //validar que exista en la BD
        let user = await User.findOne({username: data.username});
        //Validar la contraseña
        if(user && await checkPassword(data.password, user.password)) {

            let token = await createToken(user)
            let userLogged = {
                username: user.username,
                name: user.name
            }
            return res.send({message: 'User logged sucessfully', token, userLogged, });
        }
        return res.status(401).send({message: 'Invalid credentials'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error, not logged'});
    }
}



exports.update = async(req, res)=>{
    try {
        let data = req.body;
        let userId = req.params.id;
        //Validar que le llegue data a actualizar
        if(data.password || Object.entries(data).length === 0 || data.role) return res.status(400).send({message: 'Have submitted some data that cannot be updated'});
        let updateUser = await User.findOneAndUpdate(
            {_id: userId},
            data,
            {new: true}
        ).lean()
        if(!updateUser) return res.status(404).send({message:'User not found'});
        return res.send({message: 'User updated succesfully', updateUser});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error updating User'});
    }
}

exports.delete = async(req, res)=>{
    try{
        //Obtener el id a eliminar
        let userId = req.params.id;
        //Eliminar
        let userDeleted = await User.findOneAndDelete({_id: userId});
        if(!userDeleted) return res.send({message: 'Account not found and not deleted'});
        return res.send({message: `Account with username ${userDeleted.username} deleted sucessfully`});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not deleted'});
    }
}

//FUNCIONES DE IMAGENES

exports.addImage = async(req, res)=>{
    try{
        const userId = req.params.id;
        const alreadyImage = await User.findOne({_id: userId})
        let pathFile = './uploads/users/'
        if(alreadyImage.image) fs.unlinkSync(`${pathFile}${alreadyImage.image}`) 
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'Havent sent image'})
        //crear la ruta para guardar la imagen
        const filePath = req.files.image.path; 
        const fileSplit = filePath.split('\\') 
        const fileName = fileSplit[2];
        const extension = fileName.split('\.'); 
        const fileExt = extension[1]
        console.log(fileExt)
        if(
            fileExt == 'png' || 
            fileExt == 'jpg' || 
            fileExt == 'jpeg' || 
            fileExt == 'gif'
        ){
            const updatedUserImage = await User.findOneAndUpdate(
                {_id: userId}, 
                {image: fileName}, 
                {new: true}
            )
            if(!updatedUserImage) return res.status(404).send({message: 'User not found and not updated'});
            return res.send({message: 'User updated', updatedUserImage})
        }
        fs.unlinkSync(filePath)
        return res.status(404).send({message: 'File extension cannot admited'});
        

    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error adding image', err})
    }
}

exports.getImage = async(req, res)=>{
    try{
        const fileName = req.params.fileName;
        const pathFile = `./uploads/users/${fileName}`

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'image not found'})
        return res.sendFile(path.resolve(pathFile))
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting image'});
    }
}
