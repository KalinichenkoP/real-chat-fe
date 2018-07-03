import {NestFactory} from "@nestjs/core";
import {ApplicationModule} from "./AppModule";
// import * as config from "config";
async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule, { cors: true });
    const port = 3000;
    await app.listen(port);
}

bootstrap();
