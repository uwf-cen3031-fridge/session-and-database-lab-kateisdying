import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import express, { Application } from "express";
import session from "express-session";
import { AppController } from "./app.controller";
import { HandlebarsMiddleware } from '../middleware/handlebars.middleware';
import { UserService } from "../services/user.service";
import { mock, instance, when, anyString, anything, anyNumber, verify } from 'ts-mockito';

describe("AppController", () => {
  let app: Application;
  let controller: AppController;
  let mockedUserService:UserService = mock(UserService);

  // Setup function mocks
  when(mockedUserService.createUser( anyString(), anyString(), anyString() )).thenResolve({
    id: 1,
    username: "testing",
    email: "testing@testing.com",
    password: "testing"
  });

  when(mockedUserService.authenticateUser( "baduser", "badPassword" )).thenResolve(null);
  when(mockedUserService.authenticateUser( "testing", "password" )).thenResolve({
    id: 1,
    username: "testing",
    email: "testing@testing.com",
    password: "testing"
  });


  // Run this code before every test
  beforeAll(() => {
    // Create an express instance for testing
    app = express();

    // Add body parser
    app.use( express.urlencoded({extended: false}) );

    // Set up handlebars for our templating
    HandlebarsMiddleware.setup(app);

    // Get the mocked pokemon service for testing
    const userService: UserService = instance(mockedUserService);

    // Our controller instance to test
    controller = new AppController(userService); // Remove the argument from the constructor

    // Set up session for the user, based on cookies
    app.use(
      session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    );

    // Load the controller's router for testing
    app.use(controller.router);
  });

  it("should redirect to login", async () => {
    return request(app)
      .get("/")
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.text).toMatch(/You need to log in first/);
      });
  });

  it("should allow user signup", async () => {
    // Set up the body to post
    const body = {
      username: "testing",
      email: "test@test.com",
      password: "password"
    };
        
    return request(app)
      .post("/signup")
      .type('form')
      .send(body)
      .then((res) => {
        expect(res.statusCode).toEqual(302);
        expect(res.text).toMatch(/Redirecting to \//);
      });
  });

  it("should reject an invalid login", async () => {
    // Set up the body to post
    const body = {
      username: "baduser",
      password: "badpassword"
    };
        
    return request(app)
      .post("/processLogin")
      .type('form')
      .send(body)
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(res.text).toMatch(/Invalid username or password/);
      });
  });

  it("should process a valid login", async () => {

    // Set up the body to post
    const body2 = {
      username: "testing",
      password: "password"
    };
        
    return request(app)
      .post("/processLogin")
      .type('form')
      .send(body2)
      .then((res) => {
        expect(res.statusCode).toEqual(302);
        expect(res.text).toMatch(/Redirecting to \//);
      });
  });

});
