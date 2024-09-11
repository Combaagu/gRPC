const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const conectarDB = require('./db');
const mongoose = require('mongoose');
require('dotenv').config();


const packageDefinition = protoLoader.loadSync('tarea.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});


const tareasProto = grpc.loadPackageDefinition(packageDefinition).tareas;

// genera el modelo de la tarea en mongo
const Tarea = mongoose.model('Tarea', new mongoose.Schema({
  titulo: String,
  descripcion: String,
  created_at: { type: Date, default: Date.now },
}));

// los servicios gRPC
const server = new grpc.Server();

//add services
server.addService(tareasProto.ServicioTareas.service, {
  CrearTarea: async (call, callback) => {
    const { titulo, descripcion } = call.request;
    try {
      const nuevaTarea = new Tarea({ titulo, descripcion });
      await nuevaTarea.save();
      callback(null, { mensaje: 'Tarea creada con éxito'});
    } catch (error) {
      callback({ mensaje: 'Error al crear la tarea'});
    }
  },
  ObtenerEstadisticas: async (_, callback) => {
    try {
      const totalTareas = await Tarea.countDocuments();
      callback(null, { totalTareas });
    } catch (error) {
      callback({ mensaje: 'Error al obtener estadísticas' });
    }
  },
});

const iniciarServidor = () => {
  conectarDB();
  server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Servidor gRPC corriendo en el puerto ${process.env.PORT}`);
    server.start();
  });
};

iniciarServidor();
