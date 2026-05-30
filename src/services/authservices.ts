import Usermodel from "../model/Usermodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {welcomeEmailTemplate} from "../email/welcomeEmail.js"
import {sendEmail} from "./sellerEmailServices.js"
const jwtseceret = process.env.JWT_SECRET_KEY;
if (!jwtseceret) {
  throw new Error("JWT secret key not configured");
}
interface User {
  name: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    sellerStatus?: string;
  };
  token: string;
  refreshToken?: string;
}

//register function
export async function register(data: User): Promise<AuthResponse> {
  try {
    const { name, email, password } = data;
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await Usermodel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error("User already exists");
    }
    //hashed passsword
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usermodel({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "7d" },
    );

    const response: AuthResponse = {
      message: "User registered successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
      },
      token,
      refreshToken,
    };
    const{subject, html} = welcomeEmailTemplate(
      newUser.name,
    );
    await sendEmail({to: "navadesignz11@gmail.com", subject, html});

    return response;
  } catch (error: any) {
    throw new Error(error.message || "Server error");
  }
}

//login function
interface LoginData {
  email: string;
  password: string;
}
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const { email, password } = data;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await Usermodel.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "7d" },
    )

    const response: AuthResponse = {
      message: "User logged in successfully",
      user: {
        id: user._id.toString(),
        name: user.name.trim(),
        email: user.email.trim(),
        role: user.role,
        sellerStatus: user.sellerStatus,
      },
      token,
      refreshToken,
    };
    console.log("USER FOUND:", user);
    return response;
  } catch (error: any) {
    console.log("Login error:", error);
    throw new Error( error.message || "Login Failed");
  }
}
