const express = require('express')
const usuarios = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Usuario = require('../models/Usuario')
usuarios.use(cors())

process.env.SECRET_KEY = 'secret'

usuarios.post('/registrar', (req, res) => {
  const today = new Date()
  const datosUsuario = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    correo: req.body.correo,
    clave: req.body.clave,
    creacion: today
  }

  Usuario.findOne({
    where: {
      correo: req.body.correo
    }
  })
    //TODO bcrypt
    .then(usuario => {
      if (!usuario) {
        bcrypt.hash(req.body.clave, 10, (err, hash) => {
          datosUsuario.clave = hash
          Usuario.create(datosUsuario)
            .then(usuario => {
              res.json({ status: usuario.correo + ' Registrado!' })
            })
            .catch(err => {
              res.send('error: ' + err)
            })
        })
      } else {
        res.json({ error: 'El usuario ya existe!' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

usuarios.post('/login', (req, res) => {
  Usuario.findOne({
    where: {
      correo: req.body.correo
    }
  })
    .then(usuario => {
      if (usuario) {
        if (bcrypt.compareSync(req.body.clave, usuario.clave)) {
          let token = jwt.sign(usuario.DataValue, process.env.SECRET_KEY, {
            expiresIn: 1440
          })
          res.send(token)
        }
      } else {
        res.status(400).json({ error: 'El usuario no existe' })
      }
    })
    .catch(err => {
      res.status(400).json({ error: err })
    })
})

usuarios.get('/profile', (req, res) => {
  var decoded = jwt.verify(req.headers['autorización'], process.env.SECRET_KEY)

  Usuario.findOne({
    where: {
      id: decoded.id
    }
  })
    .then(usuario => {
      if (usuario) {
        res.json(usuario)
      } else {
        res.send('El usuario no existe')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

module.exports = usuarios