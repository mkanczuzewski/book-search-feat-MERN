const { AuthErr, concatenateTypeDefs } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password');

                return userData;
            }

            throw new AuthErr('Not logged in')
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthErr("Wrong Login Information")
            }
            const correctPass = await user.isCorrectPassword(password);
            if (!correctPass) {
                throw new AuthErr("Wrong Login Information")
            }
            const token = signToken(user)
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    {_id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );
                return updatedUser
            }
            throw new AuthErr('You are not logged in!');
        },

        removeBook: async (parrent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }}},
                    { new: true }
                );
                return updatedUser
            }
            throw new AuthErr('You are not logged in')
        },
    },
};

module.exports = resolvers;