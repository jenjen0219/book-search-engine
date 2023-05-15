const { AuthenticationError } = require('apollo-server-express');
//we only need to bring in user because the books are being added to the users account, we are not inherently changing anything about the books themselves
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        savedBooks: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOne({ _id: context.user._id }).populate('savedBooks');
                return user.savedBooks;
            }
        },
        me: async (parent, args, context) => {
            // check if the user exists
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select(
                    '-__v -password'
                );
                return userData;
            }
            throw new AuthenticationError('Not logged in.');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            // check if user exists with email and credentials
            if (!user) {
                throw new AuthenticationError('Incorrect credentials.');
            }
            const correctPassword = await user.isCorrectPassword(password);

            // check password
            if (!correctPassword) {
                throw new AuthenticationError('Incorrect credentials.');
            }

            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: newBook } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;