import jwt from "jsonwebtoken";

const refreshTokenResolver = {
  Mutation: {
    refreshToken: async (_: any, __: any, { req, res }: any) => {
      try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token provided");
        }

        const verifyToken = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_KEY as string
        ) as any;

        const newToken = jwt.sign(
          {
            userId: verifyToken.userId,
            role: verifyToken.role,
          },
          process.env.JWT_SECRET_KEY as string,
          { expiresIn: "15m" }
        );

        return {
          message: "Token refreshed successfully",
          token: newToken,
        };
      } catch (error: any) {
        throw new Error(error.message || "Server error");
      }
    },


    logout: async(_:any, __:any, {req, res}: any) => {
      try{
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        return {
          message: "Logged out successfully",
          success: true
        };

      }catch(error: any){
        throw new Error(error.message || "Server error");
      }
    }
  },
};

export default refreshTokenResolver;