const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const conectarDB = require('./db');
const mongoose = require('mongoose');
require('dotenv').config();

// Cargar el archivo proto
const packageDefinition = protoLoader.loadSync('tarea.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tareasProto = grpc.loadPackageDefinition(packageDefinition).tareas;

// Modelo de la tarea en MongoDB
const Tarea = mongoose.model('Tarea', new mongoose.Schema({
  titulo: String,
  descripcion: String,
  created_at: { type: Date, default: Date.now },
  estado: { type: Number, default: 1 }, // 1: Activo, 0: Inactivo
}));

// Crear servidor gRPC
const server = new grpc.Server();

server.addService(tareasProto.ServicioTareas.service, {
  // Crear una nueva tarea
  CrearTarea: async (call, callback) => {
    const { titulo, descripcion } = call.request;
    try {
      const nuevaTarea = new Tarea({ titulo, descripcion });
      await nuevaTarea.save();
      callback(null, { mensaje: 'Tarea creada con éxito', exito: true });
    } catch (error) {
      callback({ mensaje: 'Error al crear la tarea', exito: false });
    }
  },
// Obtener todas las tareas (con id y fecha de creación)
// Obtener todas las tareas (con id, título, descripción y fecha de creación)
ObtenerTareas: async (_, callback) => {
  try {
    const tareas = await Tarea.find({}, 'id titulo descripcion created_at');
    callback(null, { tareas });
  } catch (error) {
    callback({ mensaje: 'Error al obtener las tareas', exito: false });
  }
},


  // Dar de baja una tarea (inactivar)
  DarDeBajaTarea: async (call, callback) => {
    const { id } = call.request;
    try {
      const tarea = await Tarea.findById(id);
      if (!tarea) {
        callback(null, { mensaje: 'Tarea no encontrada', exito: false });
        return;
      }
      tarea.estado = 0; // Dar de baja (inactivo)
      await tarea.save();
      callback(null, { mensaje: 'Tarea dada de baja con éxito', exito: true });
    } catch (error) {
      callback({ mensaje: 'Error al dar de baja la tarea', exito: false });
    }
  },

  // Obtener estadísticas de tareas
  ObtenerEstadisticas: async (_, callback) => {
    try {
      const totalTareas = await Tarea.countDocuments();
      const tareasActivas = await Tarea.countDocuments({ estado: 1 });
      const tareasInactivas = await Tarea.countDocuments({ estado: 0 });
      callback(null, {
        totalTareas,
        tareasActivas,
        tareasInactivas
      });
    } catch (error) {
      callback({ mensaje: 'Error al obtener estadísticas' });
    }
  },
});

// Iniciar servidor gRPC
const iniciarServidor = () => {
  conectarDB(); // Conectar a MongoDB
  server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Servidor gRPC corriendo en el puerto ${process.env.PORT}`);
    server.start();
  });
};

iniciarServidor();
