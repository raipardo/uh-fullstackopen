require('dotenv').config()
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented
*/

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
  name: String!
  born: Int
  id: ID!
  bookCount: Int
}

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`

const resolvers = {
  Author: {
    bookCount: async (parent) => {
      return await Book.countDocuments({ author: parent._id })
    }
  },
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (_, args) => {
      let filter = {}

      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        filter.author = author._id
      }

      return Book.find(filter).populate('author')
    },
    allAuthors: async () => Author.find({}),
    me: (_, __, context) => context.currentUser
  },

  Mutation: {
    addBook: async (_, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }

      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        const book = new Book({ ...args, author: author._id })
        await book.save()
        return book.populate('author')
      } catch (error) {
        throw new GraphQLError('Failed to add book', {
          extensions: {
            code: 'BAD_USER_INPUT',
            message: error.message
          }
        })
      }
    },

    editAuthor: async (_, { name, setBornTo }, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }

      const author = await Author.findOne({ name })
      if (!author) return null

      author.born = setBornTo
      return author.save()
    },

    createUser: async (_, args) => {
      const user = new User(args)
      try {
        await user.save()
        return user
      } catch (error) {
        throw new GraphQLError('Creating user failed', {
          extensions: { code: 'BAD_USER_INPUT', message: error.message }
        })
      }
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username })
      const valid = password === 'secret' // hardcoded

      if (!user || !valid) {
        throw new GraphQLError('Wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = { username: user.username, id: user._id }
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch {
        return { currentUser: null }
      }
    }
    return { currentUser: null }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
