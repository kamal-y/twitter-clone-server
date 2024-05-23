
export const userTypes = `#graphql

    type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String

    follower: [User]
    following: [User]

    createdAt: String

    recommendedUsers: [User]
    tweetsLiked: [String]

    tweets: [Tweet]

    }

`