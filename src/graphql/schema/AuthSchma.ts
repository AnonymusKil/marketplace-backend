import { gql } from "graphql-tag";
export const authTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    sellerStatus: String
    createdAt: String!
  }
  type Seller {
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
  type AuthResponse {
    message: String!
    user: User!
    token: String!
  }
  type logOutResponse {
    success: Boolean!
    message: String!
  }
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    images: [String!]!
    category: String!
    publicId: String!
    seller: Seller!
  }
  type CartItem {
    product: Product!
    quantity: Int!
    priceAtAdd: Float!
  }
  type Coupon {
    couponCode: String!
    expiryDate: String!
    couponDescription: String!
    discountType: String!
    discountValue: Float!
    isActive: Boolean!
    maxUses: Int!
  }
  type OrderItem {
    product: Product!
    quantity: Int!
    price: Float!
    name: String!
    image: String!
  }

  type Order {
    items: [OrderItem!]!
    total: Float!
    subtotal: Float!
    discount: Coupon
    status: String
  }

  type CheckOut {
    amount: Float!
    email: String!
    orderID: ID!
    reference: String!
    authorizationUrl: String!
  }
  type Review {
    product: Product!
    user: User!
    rating: Float!
    content: String!
    createdAt: String!
    updatedAt: String!
  }
  type Cart {
    items: [CartItem!]!
    totalPrice: Float!
  }

  type RefreshTokenResponse {
    message: String!
    token: String!
  }
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input checkOutInput {
    orderID: ID!
  }
  input verifyPayment {
    reference: String!
  }
  type verifyPaymentResponse {
    message: String!
    status: String!
    reference: String!
  }
  type checkOutResponse {
    message: String!
    authorization_url: String!
    reference: String!
  }
  input createCouponInput {
    couponCode: String!
    expiryDate: String!
    couponDescription: String!
    discountType: String!
    discountValue: Float!
    isActive: Boolean!
    maxUses: Int!
  }
  input CreateReviewInput {
    productId: ID!
    content: String!
    rating: Float!
  }
  type ReviewResponse {
    message: String!
    review: Review!
  }

  type CreateCouponResponse {
    message: String!
    couponCode: String!
  }
  input LoginInput {
    email: String!
    password: String!
  }
  input ApproveSellerInput {
    sellerId: ID!
    sellerStatus: String!
  }

  input BecomeASellerInput {
    storeName: String!
    description: String!
    businessEmail: String!
    businessPhone: String!
    businessLogo: String!
    businessAddress: String!
    publicId: String!
  }

  input CreateProductInput {
    name: String!
    description: String!
    price: Float!
    category: String!
    images: [String!]!
    publicId: String!
  }
  input AddToCartInput {
    productId: ID!
    quantity: Int!
  }
  input DeleteCartInput {
    productId: ID!
    deleteAll: Boolean
  }
  input createOrderInput {
    couponCode: String
    paymentMethod: String!
  }
  type BecomeASellerResponse {
    message: String!
    sellerStatus: String!
    seller: Seller!
  }
  type CartResponse {
    message: String!
    cart: Cart!
  }
  type SellerReviewStats {
    totalReviews: Int!
    averageRating: Float!
  }
  type SellerOrderStats {
    totalOrders: Int!
    totalEarnings: Int!
    totalItemsSold: Int!
    totalProducts: Int!
  }
  type OrderResponse {
    message: String!
    order: Order!
  }

  type ProductResponse {
    message: String!
    product: Product!
  }
  type AdminAnalytics {
    totalProducts: Int!
    totalRevenue: Float!
    totalOrders: Int!
    totalStores: Int!
  }

  type Query {
    me: User!
    sellerProfile: Seller!
    sellers(status: String): [Seller!]!
    products: [Product!]!
    getProductsByProductId(productId: ID!): Product!
    mysellerProducts: [Product!]!
    getCart: Cart!
    getOrders: [Order!]!
    getCoupons: [Coupon!]!
    getProductReviews(productId: ID!): [Review!]!
    getSellerReviews: [Review!]!
    getSellerReviewStats: SellerReviewStats!
    sellerOrderStats: SellerOrderStats!
    adminAnalytics: AdminAnalytics!
  }

  type Mutation {
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    addOrUpdateCartItem(input: AddToCartInput!): CartResponse!
    becomeASeller(input: BecomeASellerInput!): BecomeASellerResponse!
    approveSeller(input: ApproveSellerInput!): BecomeASellerResponse!
    createOrder(input: createOrderInput!): OrderResponse!
    createCoupon(input: createCouponInput!): CreateCouponResponse!
    createProduct(input: CreateProductInput!): ProductResponse!
    initializePayment(input: checkOutInput!): checkOutResponse!
    deleteCartItem(input: DeleteCartInput!): CartResponse!
    verifyPayment(input: verifyPayment!): verifyPaymentResponse!
    createReview(input: CreateReviewInput!): ReviewResponse!
    refreshToken: RefreshTokenResponse!
    logout: logOutResponse!
  }
`;
