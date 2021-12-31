const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const conectarDB = require('./config/db')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

//Conectar a la base de datos
conectarDB()

// servidor
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({req}) => {
		//console.log(req.headers['authorization'])

		const token = req.headers['authorization'] || '';
		if(token) {
			try {
				const usuario = jwt.verify(token, process.env.ANONIMO )
				// console.log(usuario)
				return {
					usuario
				}
			} catch (error) {
					console.log(error)
					console.log('Hubo un error')
			}
		}
	}
})


// arrancar el servidor
server.listen().then( ({url}) => {
	console.log(`Servidor corriendo en la URL ${url}`)
} )
