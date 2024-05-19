export const queries = `#graphql

    verifyGoogleToken(token: String!): String
    getCurrentUserDetails: User

    getUserById(id : ID!) : User

`