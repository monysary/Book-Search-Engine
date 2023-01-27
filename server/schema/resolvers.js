const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You are not logged in!');
        }
    },

    Mutation: {
        // Login route
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Email not found!')
            };

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!')
            };

            const token = signToken(user);
            return { token, user };
        },

        // Add new user route
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },

        // Add book to user route
        savedBook: async (parent, { bookData }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You are not logged in!')
            }

            const addBook = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookData } },
                { new: true }
            )

            return addBook;
        },

        // Delete book from user route
        removeBook: async (parent, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You are not logged in!')
            }

            const deleteBook = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            )

            return deleteBook;
        }
    }
}

module.exports = resolvers;