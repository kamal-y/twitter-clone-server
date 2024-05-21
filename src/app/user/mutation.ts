export const mutations = `#graphql
    followUser(to: ID!):Boolean
    unFollowUser(to: ID!):Boolean
    deleteTweetById(id: String):Boolean
`