
const mongoose = require('mongoose')

const ClientesSchema = mongoose.Schema({
	nombre: {
		type: String,
		required: true,
		trim: true
	},
	apellido: {
		type: String,
		required: true,
		trim: true
	},
	sucursal: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	telefono: {
		type: String,
		trim: true
	},
	cisternasP: {
		type: String,
		trim: true
	},
	m3P:{
		type: String,
		trim: true
	},
	cisternasT: {
		type: String,
		trim: true
	},
	m3T: {
		type: String,
		trim: true
	},
	creado: {
		type: Date,
		default: Date.now()
	},
	vendedor: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Usuario'
	}


})

module.exports = mongoose.model('Cliente', ClientesSchema)
