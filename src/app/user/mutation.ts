export const mutations = `#graphql
    followUser(to: ID!):Boolean
    unFollowUser(to: ID!):Boolean
    deleteTweetById(id: String):Boolean
    likeTweetById(id:String):Boolean
    unlikeTweetById(id:String):Boolean
`