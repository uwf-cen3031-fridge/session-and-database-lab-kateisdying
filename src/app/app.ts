// Import the express and pino (logger) libraries
import express, { Application } from "express";
import session from "express-session";
import { pino } from "pino";

// Import our code (controllers and middleware)
import { AppController } from "./controllers/app.controller";
import { ErrorMiddleware } from "./middleware/error.middleware";
import { HandlebarsMiddleware } from "./middleware/handlebars.middleware";
import { UserService } from "./services/user.service";

class App {
  // Create an instance of express, called "app"
  public app: Application = express();
  public port: number;
  private log: pino.Logger = pino();

  // Middleware and controller instances
  private errorMiddleware: ErrorMiddleware;
  private appController: AppController;
  private userService: UserService;

  constructor(port: number) {
    this.port = port;

    // Init the service
    this.userService = new UserService();

    // Init the middlware and controllers
    this.errorMiddleware = new ErrorMiddleware();
    this.appController = new AppController(this.userService);

    // Serve all static resources from the public directory
    this.app.use(express.static(__dirname + "/public"));

    // Allows express to parse and understand
    // POST message bodies
    this.app.use(express.urlencoded({ extended: true }));

    // Set up sessions
    const COOKIE_SECRET = "keyboard cat"; // My secret to secure cookies

    // Set up session for the user, based on cookies
    this.app.use(
      session({
        secret: COOKIE_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    );

    // Set up handlebars for our templating
    HandlebarsMiddleware.setup(this.app);

    // Tell express what to do when our routes are visited
    this.app.use(this.appController.router);
    this.app.use(this.errorMiddleware.router);
  }

  public listen() {
    // Tell express to start listening for requests on the port we specified
    this.app.listen(this.port, () => {
      this.log.info(
        `Express started on http://localhost:${this.port}; press Ctrl-C to terminate.`
      );
    });
  }
}

export default App;
