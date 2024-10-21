import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json'

export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('API for Data-bank Backend')
        .setVersion(version)
        .setDescription('This API provides endpoints for managing the Data-bank backend.')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            operationsSorter: (a: any, b: any) => {
                const methodsOrder = ['post', 'get', 'put', 'patch', 'delete', 'options', 'trace'];
                let result = methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'));
                if (result === 0) {
                    result = a.get('path').localeCompare(b.get('path'));
                }
                return result;
            },
            tagsSorter: 'alpha',
        },
    });
}