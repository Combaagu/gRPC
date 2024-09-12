const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const packageDefinition = protoLoader.loadSync('tarea.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tareasProto = grpc.loadPackageDefinition(packageDefinition).tareas;

const cliente = new tareasProto.ServicioTareas(`localhost:${process.env.PORT}`, grpc.credentials.createInsecure());


// Ruta para crear una tarea
app.post('/tasks', (req, res) => {
  const { titulo, descripcion } = req.body;
  cliente.CrearTarea({ titulo, descripcion }, (error, response) => {
    if (error) res.status(500).send(error);
    else res.status(201).send(response);
  });
});

// Ruta para dar de baja una tarea
app.put('/tasks/:id/dar-de-baja', (req, res) => {
  const { id } = req.params;
  cliente.DarDeBajaTarea({ id }, (error, response) => {
    if (error) res.status(500).send(error);
    else res.status(200).send(response);
  });
});

// Ruta para obtener estadísticas de tareas
app.get('/tasks/stats', (req, res) => {
  cliente.ObtenerEstadisticas({}, (error, response) => {
    if (error) res.status(500).send(error);
    else res.status(200).send(response);
  });
});

app.listen(process.env.REST_PORT, () => {
  console.log(`Servidor API REST corriendo en el puerto ${process.env.REST_PORT}`);
});



// Ruta para obtener todas las tareas (id, título, descripción y fecha de creación)
app.get('/tasks', (req, res) => {
    cliente.ObtenerTareas({}, (error, response) => {
      if (error) res.status(500).send(error);
      else res.status(200).send(response);
    });
  });