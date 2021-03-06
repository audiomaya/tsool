const { gql } = require('apollo-server')

//Schema
const typeDefs = gql`

	type Usuario {
		id: ID
		nombre: String
		apellido: String
		email: String
		creado: String
	}

	type Token {
		token: String
	}

	type Producto {
		id: ID
		nombre: String
		existencia: Int
		precio: Float
		creado: String
	}

	type Cliente {
		id: ID
		nombre: String
		apellido: String
		sucursal: String
		email: String
		telefono: String
		cisternaP: String
		m3P: String
		cistenasT: String
		m3T: String
		vendedor: ID
	}
	
	type Pedido {
		id: ID
		pedido: [PedidoGrupo]
		total: Float
		cliente: ID
		vendedor: ID
		fecha: String
		estado: EstadoPedido
	}

	type PedidoGrupo {
		id: ID
		cantidad: Int
	}
	input UsuarioInput {
		nombre: String!
		apellido: String!
		email: String!
		password: String!
	}

	input AutenticarInput{
		email: String!
		password: String!
	}

	input ProductoInput {
		nombre: String!
		existencia: Int!
		precio: Float!
	}

	input ClienteInput {
		nombre: String!
		apellido: String!
		sucursal: String!
		email: String!
		telefono: String
		cisternasP: String
		m3P: String
		cisternasT: String
		m3T: String
	}

	input PedidoProductoInput {
		id: ID
		cantidad: Int
	}

	input PedidoInput {
		pedido: [PedidoProductoInput]
		total: Float
		cliente: ID
		estado: EstadoPedido
	}

	enum EstadoPedido {
		PENDIENTE
		COMPLETADO
		REAJENDADO
		CANCELADO
	}

	type Query {
		#Usuarios
		obtenerUsuario(token: String!) : Usuario

		#Productos
		obtenerProductos : [Producto] obtenerProducto(id: ID!) : Producto 

		#Clientes 
		obtenerClientes: [Cliente] obtenerClientesVendedor: [Cliente] 
		obtenerCliente(id: ID!): Cliente

		#Pedidos
		obtenerPedidos: [Pedido]
		obtenerPedidosVendedor: [Pedido]
		obtenerPedido(id: ID!) : Pedido
	}

	type Mutation {
		# Usuarios
		nuevoUsuario(input: UsuarioInput): Usuario
		autenticarUsuario(input: AutenticarInput) : Token

		#Productos
		nuevoProducto(input: ProductoInput) : Producto
		actualizarProducto( id: ID!, input : ProductoInput ) : Producto
		eliminarProducto(id: ID!) : String

		# Clientes
		nuevoCliente( input: ClienteInput ) : Cliente
		actualizarCliente(id: ID!, input: ClienteInput): Cliente
		eliminarCliente(id: ID!) : String

		#Pedidos
		nuevoPedido(input: PedidoInput): Pedido
		actualizarPedido(id: ID!, input: PedidoInput): Pedido
	}
`
module.exports = typeDefs
