import {gql} from 'graphql-tag';

export const authTypeDefs = gql `
type User{
id: ID!
name: String!
email: String!
role: String!
sellerStatus: String
createdAt: String!
}
type Seller{
id: ID!
storeName: String!
description: String!
businessEmail: String!
businessPhone: String!
businessLogo: String!
businessAddress: String!
publicId: String!
user: User!
}
type AuthResponse{
message: String!
user: User!
token: String!
}
type logOutResponse{
success: Boolean!
message: String!
}
type Product{
id: ID!
name: String!
description: String!
price: Float!
image: [String!]!
category: String!
stock: Int!
}

type RefreshTokenResponse{
message: String!
token: String!

}
input RegisterInput{
name: String!
email: String!
password: String!
}

input LoginInput{
email: String!
password: String!
}
input ApproveSellerInput{
sellerId: ID!
sellerStatus: String!   
}

input BecomeASellerInput{
storeName: String!
description: String!
businessEmail: String!
businessPhone: String!
businessLogo: String!
businessAddress: String!
publicId: String!
}

input CreateProductInput{
name: String!
description: String!
price: Float!
category: String!
stock: Int!
images: [String!]!
}
type BecomeASellerResponse{
message: String!
sellerStatus: String!
seller: Seller!
}

type ProductResponse{
message: String!
product: Product!
}


type Query{
me:User!
sellerProfile: Seller!
sellers(status: String): [Seller!]!
}


type Mutation{
register(
input: RegisterInput!
): AuthResponse!

login(
input: LoginInput!
): AuthResponse!

becomeASeller(
input: BecomeASellerInput!
): BecomeASellerResponse!
approveSeller(
input: ApproveSellerInput!
): BecomeASellerResponse!

createProduct(
input: CreateProductInput!
): ProductResponse!

refreshToken: RefreshTokenResponse!
logout: logOutResponse!
}

`