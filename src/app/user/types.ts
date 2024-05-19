
export const userTypes = `#graphql

    type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String

    follower :[User]
    following :[User]

    recommendedUsers : [User]

    tweets : [Tweet]
    }

`