export default `
type Book {
  _id: ID!
  title: String
  author: String
}
input InputBook {
  title: String! @constraint(minLength: 3)
  author: String! @constraint(minLength: 2)
}
type Query {
  books: [Book!]
}
type Mutation {
  addBook(newBook: InputBook!):Book!
  deleteBook(_id:ID!):Boolean
}
type Subscription {
  bookAdded:Book!
}

`;
