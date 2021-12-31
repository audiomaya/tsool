const Usuario = require('../models/Usuario')
const Producto = require('../models/Producto')
const Cliente = require('../models/Cliente')
const Pedido = require('../models/Pedido')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })


const crearToken = (usuario, anonimo, expiresIn) => {
	//console.log(usuario)
	const { id, email, nombre, apellido } = usuario

	return jwt.sign( { id, email, nombre, apellido }, anonimo, { expiresIn } )
}

//Resolvers
const resolvers = {
	Query: {
		obtenerUsuario: async (_, { token }) => {
			const usuarioId = await jwt.verify(token, process.env.ANONIMO )
			
			return usuarioId
		},

		obtenerProductos: async () => {
			try {
				const productos = await Producto.find({})
				return productos
			} catch (error){
				console.log(error)
			}
		},
		obtenerProducto: async (_, { id }) => {
			// revisar si el producto existe o no 
			const producto = await Producto.findById(id)

			if(!producto) {
				throw new Error('Producto no encontrado')
			}
			
			return producto
		},
		obtenerClientes: async () => {
			try {
				const clientes = await Cliente.find({})
				return clientes 
			} catch (error) {
				console.log(error)
			}
		},
		obtenerClientesVendedor: async (_, {}, ctx) => {
			try {
				const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() })
				return clientes 
			} catch (error) {
				console.log(error)
			}
		},
		obtenerCliente: async (_, {id}, ctx) => {
			// Revisar si el cliente existe o no
			const cliente = await Cliente.findById(id)

			if (!cliente) {
				throw new Error('Cliente no encontrado')
			}

			// Quien lo creo puede verlo
			if(cliente.vendedor.toString() !== ctx.usuario.id){
				throw new Error('No cuentas con las credenciales')
			}
			return cliente
		},
		obtenerPedidos: async () => {
			try {
				const pedidos = await Pedido.find({})
				return pedidos
			} catch {
				console.log(error)
			}
		},
		obtenerPedidosVendedor: async (_, {}, ctx) => {
			try {
				const pedidos = await Pedido.find({ vendedor: ctx.usuario.id })
				return pedidos
			} catch {
				console.log(error)
			}
		},
		obtenerPedido: async(_, {id}, ctx) => {
			//Si el pedido existe o no
			const pedido = await Pedido.findById(id)
			if(!pedido) {
				throw new Error('Pedido no encontrado')
			}

			// Solo quien lo creo puede verlo
			if (pedido.vendedor.toString() !== ctx.usuario.id) {
				throw new Error('No cuentas con las credenciales necesarias')
			}
			
			//retornar el resultado
			return pedido

		}
	},
	Mutation: {
		nuevoUsuario: async (_, { input }) => {
			
			const { email, password } = input
			
			//Revisar si el usuario existe
			const existeUsuario = await Usuario.findOne({email})
			if (existeUsuario) {
				throw new Error('El usuario ya esta registrado')
			}

			//Hashear su password
			const salt = bcryptjs.genSaltSync(10)
			input.password = bcryptjs.hashSync(password, salt)

			try{
				//Guardarlo en la base de datos
				const usuario = new Usuario(input)
				usuario.save(); //guardarlo
				return usuario 
			} catch (error) {
					console.log(error)
			}
		},
		autenticarUsuario: async (_, {input}) => {

			const { email, password } = input
			//Si el usuario existe
			const existeUsuario = await Usuario.findOne({ email })
			if (!existeUsuario) {
				throw new Error('El usuario no existe')
			}
			//Revisar si el password es correcto
			const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password ) 
			if (!passwordCorrecto) {
				throw new Error('El password es incorrecto')
			}
			
			//Crear el token
			return {
				token: crearToken(existeUsuario, process.env.ANONIMO, '24h')
			}
		},
		nuevoProducto: async (_, {input}) => {
			try {
				const producto = new Producto(input)

				//almacenar en la db
				const resultado = await producto.save()

				return resultado
			} catch (error) {
					console.log(error)
			}
		},
		actualizarProducto: async ( _, {id, input} ) => {
			// revisar si el producto existe o no 
			let producto = await Producto.findById(id)

			if(!producto) {
				throw new Error('Producto no encontrado')
			}

			//guardarlo en la base de datos
			producto = await Producto.findOneAndUpdate({ _id: id}, input, {new: true})
			return producto
		},
		eliminarProducto: async (_, {id}) => {			// revisar si el producto existe o no 
			let producto = await Producto.findById(id)

			if(!producto) {
				throw new Error('Producto no encontrado')
			}
			//Eliminar producto
			await Producto.findOneAndDelete({_id : id})
			return "Producto eliminado"
		},
		nuevoCliente: async ( _, { input }, ctx) => {
			console.log(ctx)
			const { email } = input
			// Verificar si el cliente ya esta asignado
			console.log(input)
			const cliente = await Cliente.findOne({ email })
			if(cliente) {
				throw new Error('Ese cliente ya esta registrado')
			}
			const nuevoCliente = new Cliente(input)
			// asignar el vendedor
			nuevoCliente.vendedor = ctx.usuario.id	
			// guardarlo en la base de datos

			try {
				const resultado = await nuevoCliente.save()
				return resultado
			} catch (error) {
				console.log(error)
			}
		},
		actualizarCliente: async (_, {id, input}, ctx) => {
			//Verificar si existe o no 
			let cliente = await Cliente.findById(id)

			if(!cliente) {
				throw new Error('Ese cliente no existe')
			}

			//Verificar si el vendedor es quien edita
			if(cliente.vendedor.toString() !== ctx.usuario.id){
				throw new Error('No cuentas con las credenciales')
			}
			// Guardar el cliente
			cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {new: true})
			return cliente
		},
		eliminarCliente: async (_, {id}, ctx) => {
			//Verificar si existe o no 
			let cliente = await Cliente.findById(id)

			if(!cliente) {
				throw new Error('Ese cliente no existe')
			}

			//Verificar si el vendedor es quien edita
			if(cliente.vendedor.toString() !== ctx.usuario.id){
				throw new Error('No cuentas con las credenciales')
			}
			// Eliminar Cliente
			await Cliente.findOneAndDelete({_id : id })
			return "Cliente Eliminado"
		},
		nuevoPedido: async (_, {input}, ctx) => {

			const { cliente } = input
			// Verificar si el cliente existe
			let clienteExiste = await Cliente.findById(cliente)

			if(!clienteExiste) {
				throw new Error('Ese cliente no existe')
			}
			
			// Verificar si el cliente pertenece al vendedor
			if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
				throw new Error('No cuentas con las credenciales')
			}
			// Revisar si existe disponibilidad de servicio
			for await ( const articulo of input.pedido ) {
				const { id } = articulo
				
				const producto = await Producto.findById(id)

				if(articulo.cantidad > producto.existencia) {
					throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`)
				} else {
					//Restar la cantidad del pedido
					producto.existencia = producto.existencia - articulo.cantidad

					await producto.save()
				}
			}

			// Crear un pedido
			const nuevoPedido = new Pedido(input)
			
			// Asignarle un vendedor
			nuevoPedido.vendedor = ctx.usuario.id
			
			//Guardarlo en la base de datos
			const resultado = await nuevoPedido.save()
			return resultado
		},
		actualizarPedido: async(_, {id, input}, ctx) => {

			const { cliente } = input
			// Si el pedido existe
			const existePedido = await Pedido.findById(id)
			if(!existePedido) {
				throw new Error('El pedido no existe')
			}
			
			//Si el cliente existe
			const existeCliente = await Cliente.findById(cliente)
			if(!existeCliente) {
				throw new Error('El cliente no existe')
			}

			//Si el cliente y pedido pertenece al vendedor
			if(existeCliente.vendedor.toString() !== ctx.usuario.id) {
				throw new Error('No cuentas con las credenciales necesarias')
			}

			//Revisar el Stock opción dada en el curso "no funciona"
			//for await ( const articulo of input.pedido ) {
				//const { id } = articulo
				//const producto = await Producto.findById(id)

				//if(articulo.cantidad > producto.existencia) {
					//throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`)
				//} else {
					//producto.existencia = producto.existencia - articulo.cantidad

					//await producto.save()
				//}
			//}

			//Opción dada por la comunidad del curso
			for await (const articulo of input.pedido) {
				const { id, cantidad } = articulo
				const producto = await Producto.findById(id)
				const {nombre, existencia}= producto
				if (cantidad > existencia) throw new Error(`El articulo: ${nombre} excede la cantidad disponible`)
				const cantidadAnterior = pedido.pedido.find(item => item.id === id).cantidad
				producto.existencia = existencia + cantidadAnterior - cantidad
				producto.save()
			}

			//Guardar el pedido
			const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true})
			return resultado
		}
	}
}

module.exports = resolvers