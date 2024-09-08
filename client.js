// client.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
require('dotenv').config();

const packageDefinition = protoLoader.loadSync('tarea.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tareasProto = grpc.loadPackageDefinition(packageDefinition).tareas;

const cliente = new tareasProto.ServicioTareas(`localhost:${process.env.PORT}`, grpc.credentials.createInsecure());

cliente.CrearTarea({ titulo: 'Nueva Tarea', descripcion: 'Descripción de la tarea' }, (error, response) => {
  if (error) console.error(error);
  else console.log('Respuesta:', response);
});

// Ejemplo para obtener estadísticas de tareas
cliente.ObtenerEstadisticas({}, (error, response) => {
  if (error) console.error(error);
  else console.log('Estadísticas:', response);
});
