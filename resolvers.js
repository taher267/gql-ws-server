import { PubSub } from "graphql-subscriptions";
import Book from "./book/book.model.js";
import bookController from "./book/book.controller.js";
export const pubsub = new PubSub();

export default {
    Query: {
        books: bookController.allBooks,
    },
    Mutation: {
        addBook: bookController.addBook,
        deleteBook: async (_, { _id }) => {
            console.log(_id);
            await Book.deleteOne({ _id });
            return true;
        },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(["ADD_BOOK"]),
        },
    },
};
