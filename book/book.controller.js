import { GraphQLError } from "graphql";
import Book from "./book.model.js";
import { pubsub } from "../resolvers.js";

// Book.find().exec().then(console.log).catch(console.error)
export default {
    addBook: async (_, { newBook }) => {
        try {
            const book = await Book.create(newBook);
            const result = { id: book.id, ...book._doc };
            const ws = { _id: result.id, title: result.title, author: result.author };
            pubsub.publish("ADD_BOOK", {
                bookAdded: ws,
            });

            return result;
        } catch (e) {
            // BAD_USER_INPUT
            throw new GraphQLError(`Failue to craete Book!`, {
                extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    custom: {
                        message: e.message,
                    },
                },
            });
        }
    },
    allBooks: async (_, { }) => {
        try {
            const books = await Book.find().exec();
            // console.log(books)
            return books;
        } catch (e) {
            // BAD_USER_INPUT
            throw new GraphQLError(`Failue to get Books!`, {
                extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    custom: {
                        message: e.message,
                    },
                },
            });
        }
    },
};
